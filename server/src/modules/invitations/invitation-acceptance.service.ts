import {
  BadRequestException,
  ConflictException,
  GoneException,
  Injectable,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as bcrypt from 'bcryptjs';
import { StaffInvitation, StaffInvitationDocument, InvitationStatus } from './schemas/staff-invitation.schema';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import { Role, RoleDocument, RoleStatus } from '../roles/schemas/role.schema';
import { AccountType } from '../../common/enums/account-type.enum';
import { AuditService } from '../audit/audit.service';
import { AuditEvent } from '../audit/audit-event.enum';

function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}*@${domain}`;
  return `${local[0]}***${local[local.length - 1]}@${domain}`;
}

@Injectable()
export class InvitationAcceptanceService {
  constructor(
    @InjectModel(StaffInvitation.name)
    private readonly invitationModel: Model<StaffInvitationDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly auditService: AuditService,
  ) {}

  async verify(token: string) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException({ code: 'INVITATION_INVALID', message: 'Invitation token is missing or malformed' });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const inv = await this.invitationModel.findOne({ tokenHash }).lean();

    if (!inv) {
      throw new BadRequestException({ code: 'INVITATION_INVALID', message: 'Invitation not found or invalid token link' });
    }

    if (inv.status === InvitationStatus.REGISTERED) {
      throw new ConflictException({
        code: 'INVITATION_ALREADY_ACCEPTED',
        message: 'This invitation has already been accepted. Please sign in with your credentials.',
      });
    }

    if (inv.status === InvitationStatus.REVOKED) {
      throw new GoneException({
        code: 'INVITATION_REVOKED',
        message: 'This invitation has been revoked by an administrator.',
      });
    }

    const now = new Date();
    if (inv.status === InvitationStatus.EXPIRED || inv.expiresAt < now) {
      await this.invitationModel.updateOne({ _id: inv._id }, { $set: { status: InvitationStatus.EXPIRED } });
      throw new GoneException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation link has expired. Please ask your administrator to resend your invite.',
      });
    }

    const role = await this.roleModel.findById(inv.roleIds[0]).lean();

    return {
      success: true,
      data: {
        firstName: inv.firstName,
        lastName: inv.lastName,
        email: maskEmail(inv.email),
        fullEmail: inv.email,
        roleName: role?.name || 'Administrator',
        designation: inv.designation,
        expiresAt: inv.expiresAt,
      },
    };
  }

  async accept(token: string, password: string, reqMeta?: { ip?: string; userAgent?: string }) {
    if (!token || typeof token !== 'string') {
      throw new BadRequestException({ code: 'INVITATION_INVALID', message: 'Invitation token is required' });
    }

    const tokenHash = crypto.createHash('sha256').update(token.trim()).digest('hex');
    const now = new Date();

    // Atomic state transition: exactly one concurrent request can transition from INVITED to REGISTERED
    const inv = await this.invitationModel.findOneAndUpdate(
      {
        tokenHash,
        status: InvitationStatus.INVITED,
        expiresAt: { $gt: now },
      },
      {
        $set: {
          status: InvitationStatus.REGISTERED,
          registeredAt: now,
        },
      },
      { new: false },
    );

    if (!inv) {
      // Discriminate why the atomic update failed
      return this.handleAcceptFailure(tokenHash, now);
    }

    // Check role is active
    const role = await this.roleModel.findById(inv.roleIds[0]);
    if (!role || role.status !== RoleStatus.ACTIVE) {
      // Revert status
      await this.invitationModel.updateOne({ _id: inv._id }, { $set: { status: InvitationStatus.INVITED } });
      throw new BadRequestException({
        code: 'ROLE_INACTIVE',
        message: 'The role assigned to this invitation is inactive. Please contact an administrator.',
      });
    }

    // Check email uniqueness again
    const existing = await this.userModel.findOne({ email: inv.email.toLowerCase() });
    if (existing) {
      throw new ConflictException({
        code: 'EMAIL_TAKEN',
        message: 'An account with this email address already exists',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const user = await this.userModel.create({
      name: `${inv.firstName} ${inv.lastName}`.trim(),
      firstName: inv.firstName,
      lastName: inv.lastName,
      email: inv.email.toLowerCase(),
      accountType: AccountType.STAFF,
      roleIds: [role._id.toString()],
      userCode: inv.userCode,
      designation: inv.designation,
      status: UserStatus.ACTIVE,
      passwordHash,
      hasPassword: true,
      mustChangePassword: false,
      isEmailVerified: true,
      invitationId: inv._id.toString(),
      invitedBy: inv.invitedBy,
    });

    await this.invitationModel.updateOne(
      { _id: inv._id },
      { $set: { userId: user._id.toString() } },
    );

    await this.auditService.log({
      event: AuditEvent.INVITATION_ACCEPTED,
      userId: user._id.toString(),
      email: user.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        invitationId: inv._id.toString(),
        roleId: role._id.toString(),
        roleName: role.name,
      },
    });

    await this.auditService.log({
      event: AuditEvent.USER_CREATED,
      userId: user._id.toString(),
      email: user.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        accountType: 'STAFF',
        userCode: user.userCode,
        roleName: role.name,
        viaInvitation: inv._id.toString(),
      },
    });

    return {
      success: true,
      message: 'Account created successfully. Please sign in to access the administration console.',
    };
  }

  private async handleAcceptFailure(tokenHash: string, now: Date) {
    const inv = await this.invitationModel.findOne({ tokenHash });
    if (!inv) {
      throw new BadRequestException({ code: 'INVITATION_INVALID', message: 'Invitation not found or invalid token link' });
    }
    if (inv.status === InvitationStatus.REGISTERED) {
      throw new ConflictException({
        code: 'INVITATION_ALREADY_ACCEPTED',
        message: 'This invitation has already been accepted.',
      });
    }
    if (inv.status === InvitationStatus.REVOKED) {
      throw new GoneException({
        code: 'INVITATION_REVOKED',
        message: 'This invitation has been revoked.',
      });
    }
    if (inv.status === InvitationStatus.EXPIRED || inv.expiresAt <= now) {
      throw new GoneException({
        code: 'INVITATION_EXPIRED',
        message: 'This invitation link has expired.',
      });
    }
    throw new BadRequestException({ code: 'INVITATION_INVALID', message: 'Unable to process invitation' });
  }
}
