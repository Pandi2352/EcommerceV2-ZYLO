import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { StaffInvitation, StaffInvitationDocument, InvitationStatus } from './schemas/staff-invitation.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { Role, RoleDocument, RoleStatus } from '../roles/schemas/role.schema';
import { MailService } from '../mail/mail.service';
import { staffInvitationTemplate } from '../mail/templates/auth.templates';
import { AuditService } from '../audit/audit.service';
import { AuditEvent } from '../audit/audit-event.enum';
import { CreateInvitationDto } from './dto/create-invitation.dto';
import { InvitationQueryDto } from './dto/invitation-query.dto';
import { UserCodeService } from './user-code.service';
import { decrypt, encrypt } from '../../common/utils/crypto.util';

const INVITATION_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

@Injectable()
export class InvitationsService {
  private readonly adminAppUrl: string;
  private readonly encryptionKey: string;

  constructor(
    @InjectModel(StaffInvitation.name)
    private readonly invitationModel: Model<StaffInvitationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    private readonly configService: ConfigService,
    private readonly userCodes: UserCodeService,
  ) {
    this.adminAppUrl = this.configService.get<string>('app.adminUrl') || 'http://127.0.0.1:5175';
    this.encryptionKey = this.configService.getOrThrow<string>('app.encryptionKey');
  }

  /** Rebuild the invite URL from the encrypted token; undefined if absent or unreadable. */
  private inviteUrlFor(tokenEncrypted?: string): string | undefined {
    if (!tokenEncrypted) return undefined;
    try {
      return `${this.adminAppUrl}/accept-invite?token=${decrypt(tokenEncrypted, this.encryptionKey)}`;
    } catch {
      return undefined; // e.g. ENCRYPTION_KEY changed since the link was issued
    }
  }

  /** `includeLinks`: add the copyable invite URL for pending invitations (callers with users.invite). */
  async list(query: InvitationQueryDto, includeLinks = false) {
    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.roleId) {
      filter.roleIds = query.roleId;
    }

    if (query.q && query.q.trim()) {
      const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { email: { $regex: escaped, $options: 'i' } },
        { firstName: { $regex: escaped, $options: 'i' } },
        { lastName: { $regex: escaped, $options: 'i' } },
        { userCode: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await this.invitationModel.countDocuments(filter);
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const list = await this.invitationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select(includeLinks ? '+tokenEncrypted' : '')
      .lean();

    // Attach role objects and lazy-check expiration
    const now = new Date();
    const items = await Promise.all(
      list.map(async (inv) => {
        let currentStatus = inv.status;
        if (currentStatus === InvitationStatus.INVITED && inv.expiresAt < now) {
          currentStatus = InvitationStatus.EXPIRED;
          await this.invitationModel.updateOne(
            { _id: inv._id },
            { $set: { status: InvitationStatus.EXPIRED }, $unset: { tokenEncrypted: 1 } },
          );
        }

        const role = await this.roleModel.findById(inv.roleIds[0]).lean();

        return {
          id: inv._id.toString(),
          firstName: inv.firstName,
          lastName: inv.lastName,
          email: inv.email,
          userCode: inv.userCode,
          designation: inv.designation,
          roleId: inv.roleIds[0],
          roleName: role?.name || 'Unknown Role',
          roleKey: role?.key || '',
          message: inv.message,
          status: currentStatus,
          expiresAt: inv.expiresAt,
          sentCount: inv.sentCount,
          lastSentAt: inv.lastSentAt,
          invitedBy: inv.invitedBy,
          invitedByName: inv.invitedByName,
          registeredAt: inv.registeredAt,
          userId: inv.userId,
          createdAt: inv.createdAt,
          inviteUrl: currentStatus === InvitationStatus.INVITED ? this.inviteUrlFor(inv.tokenEncrypted) : undefined,
        };
      }),
    );

    const totalCount = await this.invitationModel.countDocuments();
    const pendingCount = await this.invitationModel.countDocuments({
      status: InvitationStatus.INVITED,
      expiresAt: { $gt: now },
    });
    const registeredCount = await this.invitationModel.countDocuments({
      status: InvitationStatus.REGISTERED,
    });
    const expiredOrRevokedCount = await this.invitationModel.countDocuments({
      $or: [
        { status: { $in: [InvitationStatus.EXPIRED, InvitationStatus.REVOKED] } },
        { status: InvitationStatus.INVITED, expiresAt: { $lte: now } },
      ],
    });

    return {
      items,
      stats: {
        totalCount,
        pendingCount,
        registeredCount,
        expiredOrRevokedCount,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async create(dto: CreateInvitationDto, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const email = dto.email.trim().toLowerCase();
    // R9: Email must not belong to an existing user
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: `An account with email ${email} already exists`,
      });
    }

    // R9: Check if an active open invitation already exists
    const existingInvite = await this.invitationModel.findOne({
      email,
      status: InvitationStatus.INVITED,
      expiresAt: { $gt: new Date() },
    });
    if (existingInvite) {
      throw new ConflictException({
        code: 'INVITATION_PENDING_EXISTS',
        message: `A pending invitation has already been issued to ${email}`,
      });
    }


    // R8: Target role must exist and be ACTIVE
    const targetRoleId = dto.roleIds[0];
    const role = await this.roleModel.findById(targetRoleId);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Target role not found' });
    }
    if (role.status !== RoleStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'ROLE_INACTIVE',
        message: `Role "${role.name}" is currently inactive and cannot be newly assigned`,
      });
    }

    // R5: Escalation check
    this.assertNoEscalation(actor, role.permissions);

    // Auto-generated User ID from the shop prefix (e.g. ZY-0004)
    const userCode = await this.userCodes.next();

    // Generate secure 32-byte token
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const now = new Date();
    const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);

    const invitation = await this.invitationModel.create({
      firstName: dto.firstName.trim(),
      lastName: dto.lastName.trim(),
      email,
      userCode,
      designation: dto.designation?.trim(),
      roleIds: [role._id.toString()],
      message: dto.message?.trim(),
      tokenHash,
      tokenEncrypted: encrypt(rawToken, this.encryptionKey),
      status: InvitationStatus.INVITED,
      expiresAt,
      invitedBy: actor.id,
      invitedByName: actor.name || actor.email,
      sentCount: 1,
      lastSentAt: now,
    });

    const inviteLink = `${this.adminAppUrl}/accept-invite?token=${rawToken}`;

    // Send invitation email in background
    this.mailService.sendInBackground({
      to: email,
      ...staffInvitationTemplate(
        'ZYLO',
        actor.name || 'System Administrator',
        role.name,
        inviteLink,
      ),
    });

    await this.auditService.log({
      event: AuditEvent.INVITATION_SENT,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        invitationId: invitation._id.toString(),
        inviteeEmail: email,
        userCode,
        roleId: role._id.toString(),
        roleName: role.name,
      },
    });

    return {
      success: true,
      message: `Invitation successfully sent to ${email}`,
      data: {
        id: invitation._id.toString(),
        email: invitation.email,
        userCode: invitation.userCode,
        roleName: role.name,
        expiresAt: invitation.expiresAt,
        // One-time copy of the link for the inviting admin (e.g. to share manually).
        // Only the token hash is stored, so this can't be retrieved again later.
        inviteUrl: inviteLink,
      },
    };
  }

  async resend(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const inv = await this.invitationModel.findById(id);
    if (!inv) {
      throw new NotFoundException({ code: 'INVITATION_INVALID', message: 'Invitation not found' });
    }

    if (inv.status === InvitationStatus.REGISTERED) {
      throw new BadRequestException({
        code: 'INVITATION_ALREADY_ACCEPTED',
        message: 'This invitation has already been accepted and the account is registered',
      });
    }

    const now = new Date();
    // Resend throttle: at most 1 per 60 seconds
    if (inv.lastSentAt && now.getTime() - new Date(inv.lastSentAt).getTime() < 60_000) {
      throw new BadRequestException({
        code: 'TOO_MANY_ATTEMPTS',
        message: 'Please wait at least 60 seconds before resending this invitation',
      });
    }

    const role = await this.roleModel.findById(inv.roleIds[0]);
    if (!role || role.status !== RoleStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'ROLE_INACTIVE',
        message: 'The role assigned to this invitation is no longer active',
      });
    }

    // Rotate token
    const rawToken = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
    const expiresAt = new Date(now.getTime() + INVITATION_TTL_MS);

    inv.tokenHash = tokenHash;
    inv.tokenEncrypted = encrypt(rawToken, this.encryptionKey);
    inv.expiresAt = expiresAt;
    inv.sentCount += 1;
    inv.lastSentAt = now;
    inv.status = InvitationStatus.INVITED;
    await inv.save();

    const inviteLink = `${this.adminAppUrl}/accept-invite?token=${rawToken}`;

    this.mailService.sendInBackground({
      to: inv.email,
      ...staffInvitationTemplate(
        'ZYLO',
        actor.name || 'System Administrator',
        role.name,
        inviteLink,
      ),
    });

    await this.auditService.log({
      event: AuditEvent.INVITATION_RESENT,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        invitationId: inv._id.toString(),
        inviteeEmail: inv.email,
        sentCount: inv.sentCount,
      },
    });

    return {
      success: true,
      message: `Invitation email re-sent to ${inv.email}. Previous link has been invalidated.`,
      data: {
        id: inv._id.toString(),
        email: inv.email,
        userCode: inv.userCode,
        roleName: role.name,
        expiresAt: inv.expiresAt,
        inviteUrl: inviteLink,
      },
    };
  }

  async revoke(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const inv = await this.invitationModel.findById(id);
    if (!inv) {
      throw new NotFoundException({ code: 'INVITATION_INVALID', message: 'Invitation not found' });
    }

    if (inv.status === InvitationStatus.REGISTERED) {
      throw new BadRequestException({
        code: 'INVITATION_ALREADY_ACCEPTED',
        message: 'Cannot revoke an invitation that has already been registered',
      });
    }

    inv.status = InvitationStatus.REVOKED;
    inv.tokenEncrypted = undefined;
    inv.revokedAt = new Date();
    inv.revokedBy = actor.id;
    await inv.save();

    await this.auditService.log({
      event: AuditEvent.INVITATION_REVOKED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        invitationId: inv._id.toString(),
        inviteeEmail: inv.email,
      },
    });

    return {
      success: true,
      message: `Invitation for ${inv.email} has been revoked`,
    };
  }

  private assertNoEscalation(actor: any, targetPermissions: string[]) {
    const actorPerms: string[] = actor.permissions || [];
    if (actorPerms.includes('*')) {
      return;
    }
    const unheld = targetPermissions.filter((p) => !actorPerms.includes(p));
    if (unheld.length > 0) {
      throw new ForbiddenException({
        code: 'PRIVILEGE_ESCALATION',
        message: 'You cannot invite a staff member to a role granting permissions you do not hold',
      });
    }
  }
}
