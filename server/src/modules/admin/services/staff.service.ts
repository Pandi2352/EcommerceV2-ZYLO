import {
  ConflictException,
  ForbiddenException,
  HttpStatus,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, QueryFilter } from 'mongoose';
import { appConfig, AppConfig } from '../../../config/app.config';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { generateToken, sha256 } from '../../../common/utils/crypto.util';
import { UserRole, STAFF_ROLES, isStaffRole } from '../../../common/enums/user-role.enum';
import { User, UserDocument } from '../../users/schemas/user.schema';
import {
  StaffInvitation,
  StaffInvitationDocument,
} from '../schemas/staff-invitation.schema';
import { InviteStaffDto } from '../dto/invite-staff.dto';
import { AcceptInvitationDto } from '../dto/accept-invitation.dto';
import { MailService } from '../../mail/mail.service';
import { staffInvitationTemplate } from '../../mail/templates/auth.templates';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { PasswordService } from '../../auth/services/password.service';

export interface StaffListQuery {
  search?: string;
  role?: string;
  isActive?: boolean;
  page?: number;
  limit?: number;
}

export interface StaffListResponse {
  items: UserDocument[];
  total: number;
  stats: {
    totalStaff: number;
    activeCount: number;
    suspendedCount: number;
    mfaEnabledCount: number;
    rolesDistribution: Record<string, number>;
  };
}

@Injectable()
export class StaffService {
  constructor(
    @InjectModel(StaffInvitation.name)
    private readonly invitationModel: Model<StaffInvitationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly passwordService: PasswordService,
    @Inject(appConfig.KEY)
    private readonly config: AppConfig,
  ) {}

  /**
   * List all staff members (excluding pure customers) with filters and summary stats
   */
  async listStaff(query: StaffListQuery): Promise<StaffListResponse> {
    const page = Math.max(1, Number(query.page) || 1);
    const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
    const skip = (page - 1) * limit;

    const baseFilter: QueryFilter<User> = {
      role: { $in: STAFF_ROLES as unknown as UserRole[] },
    };

    if (query.role && Object.values(UserRole).includes(query.role as UserRole)) {
      baseFilter.role = query.role as UserRole;
    }

    if (query.isActive !== undefined) {
      baseFilter.isActive = query.isActive;
    }

    if (query.search && query.search.trim()) {
      const term = query.search.trim();
      baseFilter.$or = [
        { name: { $regex: term, $options: 'i' } },
        { email: { $regex: term, $options: 'i' } },
      ];
    }

    const [items, total, allStaff] = await Promise.all([
      this.userModel
        .find(baseFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.userModel.countDocuments(baseFilter).exec(),
      this.userModel
        .find({ role: { $in: STAFF_ROLES as unknown as UserRole[] } }, 'role isActive mfaEnabled')
        .exec(),
    ]);

    const stats = {
      totalStaff: allStaff.length,
      activeCount: allStaff.filter((u) => u.isActive).length,
      suspendedCount: allStaff.filter((u) => !u.isActive).length,
      mfaEnabledCount: allStaff.filter((u) => u.mfaEnabled).length,
      rolesDistribution: allStaff.reduce<Record<string, number>>((acc, u) => {
        acc[u.role] = (acc[u.role] || 0) + 1;
        return acc;
      }, {}),
    };

    return { items, total, stats };
  }

  /**
   * Update a staff member's role
   */
  async updateRole(
    targetUserId: string,
    newRole: UserRole,
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<UserDocument> {
    if (!isStaffRole(newRole)) {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_CREDENTIALS, 'Must assign a valid staff role');
    }

    const target = await this.userModel.findById(targetUserId).exec();
    if (!target) {
      throw new NotFoundException('Staff user not found');
    }

    // Safety: Cannot demote the last SUPER_ADMIN
    if (target.role === UserRole.SUPER_ADMIN && newRole !== UserRole.SUPER_ADMIN) {
      const superAdminCount = await this.userModel.countDocuments({ role: UserRole.SUPER_ADMIN }).exec();
      if (superAdminCount <= 1) {
        throw new ForbiddenException('Cannot demote the only remaining Super Administrator');
      }
    }

    const oldRole = target.role;
    target.role = newRole;
    await target.save();

    await this.auditService.log({
      event: AuditEvent.STAFF_ROLE_UPDATED,
      subject: target,
      portal: 'admin',
      meta,
      metadata: { oldRole, newRole, updatedBy: adminUser.email },
    });

    return target;
  }

  /**
   * Update a staff member's custom permissions override
   */
  async updatePermissions(
    targetUserId: string,
    permissions: string[],
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<UserDocument> {
    const target = await this.userModel.findById(targetUserId).exec();
    if (!target) {
      throw new NotFoundException('Staff user not found');
    }

    target.customPermissions = permissions;
    await target.save();

    await this.auditService.log({
      event: AuditEvent.STAFF_PERMISSIONS_UPDATED,
      subject: target,
      portal: 'admin',
      meta,
      metadata: { customPermissions: permissions, updatedBy: adminUser.email },
    });

    return target;
  }

  /**
   * Activate or suspend a staff member
   */
  async updateStatus(
    targetUserId: string,
    isActive: boolean,
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<UserDocument> {
    if (targetUserId === adminUser.id || targetUserId === adminUser._id) {
      throw new ForbiddenException('You cannot modify your own active account status');
    }

    const target = await this.userModel.findById(targetUserId).exec();
    if (!target) {
      throw new NotFoundException('Staff user not found');
    }

    target.isActive = isActive;
    await target.save();

    await this.auditService.log({
      event: AuditEvent.STAFF_STATUS_UPDATED,
      subject: target,
      portal: 'admin',
      meta,
      metadata: { isActive, updatedBy: adminUser.email },
    });

    return target;
  }

  /**
   * Issue an invitation to a new administrator
   */
  async inviteStaff(
    dto: InviteStaffDto,
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<{ invitation: StaffInvitation; inviteLink: string }> {
    const email = dto.email.toLowerCase().trim();

    // Check if user is already registered as staff
    const existingUser = await this.userModel.findOne({ email }).exec();
    if (existingUser && isStaffRole(existingUser.role)) {
      throw new ConflictException('A staff account with this email address already exists');
    }

    // Revoke any existing pending invitations for this email
    await this.invitationModel.updateMany(
      { email, status: 'PENDING' },
      { $set: { status: 'REVOKED', revokedReason: 'Superseded by new invitation' } },
    );

    // Generate single-use token & expiry (7 days)
    const rawToken = generateToken(32);
    const tokenHash = sha256(rawToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    const invitation = new this.invitationModel({
      email,
      name: dto.name?.trim(),
      role: dto.role,
      customPermissions: dto.customPermissions || [],
      tokenHash,
      expiresAt,
      status: 'PENDING',
      invitedBy: adminUser.id || adminUser._id,
      invitedByName: adminUser.name,
    });

    await invitation.save();

    // Construct invitation link
    const inviteLink = `${this.config.adminUrl}/accept-invite?token=${rawToken}`;

    // Send invitation email asynchronously
    this.mailService.sendInBackground({
      to: email,
      ...staffInvitationTemplate(this.config.name, adminUser.name, dto.role, inviteLink),
    });

    await this.auditService.log({
      event: AuditEvent.STAFF_INVITED,
      email,
      portal: 'admin',
      meta,
      metadata: {
        role: dto.role,
        invitedBy: adminUser.email,
        customPermissions: dto.customPermissions,
      },
    });

    return {
      invitation,
      inviteLink,
    };
  }

  /**
   * List all invitations
   */
  async listInvitations(): Promise<StaffInvitation[]> {
    // Auto-mark expired invitations
    await this.invitationModel.updateMany(
      { status: 'PENDING', expiresAt: { $lt: new Date() } },
      { $set: { status: 'EXPIRED' } },
    );

    return this.invitationModel.find().sort({ createdAt: -1 }).exec();
  }

  /**
   * Resend an invitation email
   */
  async resendInvitation(
    invitationId: string,
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<{ invitation: StaffInvitation; inviteLink: string }> {
    const invitation = await this.invitationModel.findById(invitationId).exec();
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN, 'Invitation has already been accepted');
    }

    const rawToken = generateToken(32);
    invitation.tokenHash = sha256(rawToken);
    invitation.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    invitation.status = 'PENDING';
    await invitation.save();

    const inviteLink = `${this.config.adminUrl}/accept-invite?token=${rawToken}`;

    this.mailService.sendInBackground({
      to: invitation.email,
      ...staffInvitationTemplate(this.config.name, adminUser.name, invitation.role, inviteLink),
    });

    await this.auditService.log({
      event: AuditEvent.STAFF_INVITED,
      email: invitation.email,
      portal: 'admin',
      meta,
      metadata: { role: invitation.role, resentBy: adminUser.email },
    });

    return { invitation, inviteLink };
  }

  /**
   * Revoke a pending invitation
   */
  async revokeInvitation(
    invitationId: string,
    adminUser: UserDocument,
    meta?: RequestMeta,
  ): Promise<StaffInvitation> {
    const invitation = await this.invitationModel.findById(invitationId).exec();
    if (!invitation) {
      throw new NotFoundException('Invitation not found');
    }

    invitation.status = 'REVOKED';
    await invitation.save();

    await this.auditService.log({
      event: AuditEvent.STAFF_INVITATION_REVOKED,
      email: invitation.email,
      portal: 'admin',
      meta,
      metadata: { revokedBy: adminUser.email },
    });

    return invitation;
  }

  /**
   * Validate an invitation token for the Accept Invite screen
   */
  async validateInviteToken(token: string): Promise<{
    email: string;
    role: UserRole;
    name?: string;
    customPermissions: string[];
    invitedByName?: string;
  }> {
    const tokenHash = sha256(token);
    const invitation = await this.invitationModel
      .findOne({ tokenHash })
      .select('+tokenHash')
      .exec();

    if (!invitation) {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN, 'Invalid or unrecognized invitation link.');
    }

    if (invitation.status === 'REVOKED') {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVITATION_REVOKED, 'This invitation has been revoked by an administrator.');
    }

    if (invitation.status === 'ACCEPTED') {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVALID_TOKEN, 'This invitation has already been accepted.');
    }

    if (invitation.expiresAt < new Date()) {
      invitation.status = 'EXPIRED';
      await invitation.save();
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.INVITATION_EXPIRED, 'This invitation link has expired. Please request a new invite.');
    }

    return {
      email: invitation.email,
      role: invitation.role,
      name: invitation.name,
      customPermissions: invitation.customPermissions,
      invitedByName: invitation.invitedByName,
    };
  }

  /**
   * Accept an invitation and set up staff account
   */
  async acceptInvitation(dto: AcceptInvitationDto, meta?: RequestMeta): Promise<UserDocument> {
    const tokenHash = sha256(dto.token);
    const invitation = await this.invitationModel
      .findOne({ tokenHash })
      .select('+tokenHash')
      .exec();

    if (!invitation || invitation.status !== 'PENDING' || invitation.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
        'Invalid, expired, or previously used invitation link.',
      );
    }

    const email = invitation.email.toLowerCase();
    let user = await this.userModel.findOne({ email }).exec();

    if (user) {
      // Existing user (e.g. customer promoted to staff)
      user.name = dto.name.trim();
      user.role = invitation.role;
      user.customPermissions = invitation.customPermissions;
      user.isActive = true;
      user.isEmailVerified = true;
    } else {
      // New staff user
      user = new this.userModel({
        name: dto.name.trim(),
        email,
        role: invitation.role,
        customPermissions: invitation.customPermissions,
        isActive: true,
        isEmailVerified: true,
        mustChangePassword: false,
      });
    }

    // Set hashed password
    await this.passwordService.setPassword(user, dto.password);

    // Mark invitation accepted
    invitation.status = 'ACCEPTED';
    invitation.acceptedAt = new Date();
    await invitation.save();

    await this.auditService.log({
      event: AuditEvent.STAFF_INVITATION_ACCEPTED,
      subject: user,
      portal: 'admin',
      meta,
      metadata: { role: invitation.role },
    });

    return user;
  }
}
