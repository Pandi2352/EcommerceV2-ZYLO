import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument, UserStatus } from '../users/schemas/user.schema';
import { Role, RoleDocument, RoleStatus } from '../roles/schemas/role.schema';
import { AccountType } from '../../common/enums/account-type.enum';
import { UserRole } from '../../common/enums/user-role.enum';
import { PermissionResolverService } from '../../common/authorization/permission-resolver.service';
import { TokenService } from '../auth/services/token.service';
import { PasswordManagementService } from '../auth/services/password-management.service';
import { AuditService } from '../audit/audit.service';
import { AuditEvent } from '../audit/audit-event.enum';
import { AuditLog, AuditLogDocument } from '../audit/schemas/audit-log.schema';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';
import { StaffUserQueryDto } from './dto/staff-user-query.dto';

const SORTABLE_FIELDS = new Set(['name', 'email', 'userCode', 'designation', 'status', 'createdAt', 'lastLoginAt']);

@Injectable()
export class StaffUsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(AuditLog.name)
    private readonly auditLogModel: Model<AuditLogDocument>,
    private readonly permissionResolver: PermissionResolverService,
    private readonly tokenService: TokenService,
    private readonly passwordManagementService: PasswordManagementService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: StaffUserQueryDto) {
    const filter: Record<string, any> = {
      deletedAt: { $exists: false },
      $or: [
        { accountType: AccountType.STAFF },
        { role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT] } },
      ],
    };

    if (query.status) {
      filter.status = query.status;
    }

    if (query.roleId) {
      filter.roleIds = query.roleId;
    }

    if (query.designation && query.designation.trim()) {
      filter.designation = query.designation.trim();
    }

    if (query.q && query.q.trim()) {
      const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$and = [
        {
          $or: [
            { name: { $regex: escaped, $options: 'i' } },
            { email: { $regex: escaped, $options: 'i' } },
            { userCode: { $regex: escaped, $options: 'i' } },
            { designation: { $regex: escaped, $options: 'i' } },
          ],
        },
      ];
    }

    if (query.createdFrom || query.createdTo) {
      filter.createdAt = {};
      if (query.createdFrom) filter.createdAt.$gte = new Date(query.createdFrom);
      if (query.createdTo) filter.createdAt.$lte = new Date(query.createdTo);
    }

    // Only allow sorting by public fields: sorting by a secret (e.g. passwordHash)
    // would leak it through the result order.
    const sortOption: Record<string, 1 | -1> = {};
    const desc = query.sort?.startsWith('-') ?? false;
    const field = query.sort ? (desc ? query.sort.slice(1) : query.sort) : '';
    if (SORTABLE_FIELDS.has(field)) {
      sortOption[field] = desc ? -1 : 1;
    } else {
      sortOption.createdAt = -1;
    }

    const total = await this.userModel.countDocuments(filter);
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const users = await this.userModel.find(filter).sort(sortOption).skip(skip).limit(limit).lean();

    const items = await Promise.all(
      users.map(async (u) => {
        const roles = await this.roleModel
          .find({ _id: { $in: u.roleIds || [] } })
          .select('name key')
          .lean();

        const role = roles[0];

        return {
          id: u._id.toString(),
          name: u.name,
          firstName: u.firstName,
          lastName: u.lastName,
          email: u.email,
          userCode: u.userCode,
          designation: u.designation,
          accountType: u.accountType,
          roleIds: u.roleIds || [],
          roleName: role?.name || u.role || 'Staff Member',
          roleKey: role?.key || (u.role ? u.role.toLowerCase() : ''),
          status: u.status || (u.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE),
          isActive: u.isActive !== false,
          isLocked: Boolean(u.lockUntil && u.lockUntil > new Date()),
          mfaEnabled: Boolean(u.mfaEnabled),
          lastLoginAt: u.lastLoginAt,
          createdAt: u.createdAt,
        };
      }),
    );

    // Compute stats
    const totalStaff = await this.userModel.countDocuments({
      deletedAt: { $exists: false },
      $or: [
        { accountType: AccountType.STAFF },
        { role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT] } },
      ],
    });

    const activeCount = await this.userModel.countDocuments({
      deletedAt: { $exists: false },
      status: UserStatus.ACTIVE,
      $or: [
        { accountType: AccountType.STAFF },
        { role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT] } },
      ],
    });

    const mfaEnabledCount = await this.userModel.countDocuments({
      deletedAt: { $exists: false },
      mfaEnabled: true,
      $or: [
        { accountType: AccountType.STAFF },
        { role: { $in: [UserRole.SUPER_ADMIN, UserRole.ADMIN, UserRole.MANAGER, UserRole.SUPPORT_AGENT] } },
      ],
    });

    return {
      items,
      stats: {
        totalStaff,
        activeCount,
        inactiveCount: totalStaff - activeCount,
        mfaEnabledCount,
      },
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string) {
    const u = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } }).lean();
    if (!u) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    const { permissions: effectivePermissions, roles } = await this.permissionResolver.forUser(u.roleIds || []);

    const recentAudit = await this.auditLogModel
      .find({ userId: id })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    return {
      id: u._id.toString(),
      name: u.name,
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      userCode: u.userCode,
      designation: u.designation,
      accountType: u.accountType,
      roleIds: u.roleIds || [],
      roles,
      effectivePermissions,
      status: u.status || (u.isActive ? UserStatus.ACTIVE : UserStatus.INACTIVE),
      isActive: u.isActive !== false,
      isLocked: Boolean(u.lockUntil && u.lockUntil > new Date()),
      mfaEnabled: Boolean(u.mfaEnabled),
      lastLoginAt: u.lastLoginAt,
      createdAt: u.createdAt,
      recentActivity: recentAudit.map((a) => ({
        id: a._id.toString(),
        event: a.event,
        ip: a.ip,
        createdAt: a.createdAt,
        metadata: a.metadata,
      })),
    };
  }

  async updateProfile(id: string, dto: UpdateStaffUserDto, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    const changes: Record<string, any> = {};

    if (dto.userCode && dto.userCode.trim().toUpperCase() !== user.userCode) {
      const nextCode = dto.userCode.trim().toUpperCase();
      const conflict = await this.userModel.findOne({ _id: { $ne: id }, userCode: nextCode });
      if (conflict) {
        throw new ConflictException({
          code: 'USER_CODE_TAKEN',
          message: `User code "${nextCode}" is already in use by another staff member`,
        });
      }
      changes.userCode = { from: user.userCode, to: nextCode };
      user.userCode = nextCode;
    }

    if (dto.firstName !== undefined && dto.firstName.trim() !== user.firstName) {
      changes.firstName = { from: user.firstName, to: dto.firstName.trim() };
      user.firstName = dto.firstName.trim();
    }

    if (dto.lastName !== undefined && dto.lastName.trim() !== user.lastName) {
      changes.lastName = { from: user.lastName, to: dto.lastName.trim() };
      user.lastName = dto.lastName.trim();
    }

    if (dto.firstName || dto.lastName) {
      const f = user.firstName || '';
      const l = user.lastName || '';
      user.name = `${f} ${l}`.trim() || user.name;
    }

    if (dto.designation !== undefined && dto.designation.trim() !== user.designation) {
      changes.designation = { from: user.designation, to: dto.designation.trim() };
      user.designation = dto.designation.trim();
    }

    await user.save();

    if (Object.keys(changes).length > 0) {
      await this.auditService.log({
        event: AuditEvent.USER_UPDATED,
        userId: actor.id,
        email: actor.email,
        ip: reqMeta?.ip || '',
        userAgent: reqMeta?.userAgent || '',
        metadata: {
          targetUserId: id,
          targetEmail: user.email,
          changes,
        },
      });
    }

    return this.getById(id);
  }

  async assignRoles(id: string, roleIds: string[], actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    // R7: Self-modification forbidden
    if (id === actor.id) {
      throw new ForbiddenException({
        code: 'SELF_MODIFICATION_FORBIDDEN',
        message: 'You cannot modify your own role assignment',
      });
    }

    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    const targetRoleId = roleIds[0];
    const targetRole = await this.roleModel.findById(targetRoleId);
    if (!targetRole) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Selected role not found' });
    }

    // R8: Target role must be active
    if (targetRole.status !== RoleStatus.ACTIVE) {
      throw new BadRequestException({
        code: 'ROLE_INACTIVE',
        message: `Role "${targetRole.name}" is inactive and cannot be assigned`,
      });
    }

    // R5: Escalation check
    this.assertNoEscalation(actor, targetRole.permissions);

    // R6: Check last active Super Admin guarantee
    await this.assertNotLastSuperAdmin(user, [targetRoleId]);

    const prevRoleIds = user.roleIds || [];
    user.roleIds = [targetRoleId];
    await user.save();

    await this.auditService.log({
      event: AuditEvent.USER_ROLE_CHANGED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        targetUserId: id,
        targetEmail: user.email,
        previousRoleIds: prevRoleIds,
        newRoleId: targetRoleId,
        newRoleName: targetRole.name,
      },
    });

    return this.getById(id);
  }

  async activate(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    if (id === actor.id) {
      throw new ForbiddenException({
        code: 'SELF_MODIFICATION_FORBIDDEN',
        message: 'You cannot alter your own account status',
      });
    }

    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    user.status = UserStatus.ACTIVE;
    user.isActive = true;
    await user.save();

    await this.auditService.log({
      event: AuditEvent.USER_ACTIVATED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: { targetUserId: id, targetEmail: user.email },
    });

    return { success: true, message: `Staff member ${user.name} has been activated` };
  }

  async deactivate(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    if (id === actor.id) {
      throw new ForbiddenException({
        code: 'SELF_MODIFICATION_FORBIDDEN',
        message: 'You cannot deactivate your own account',
      });
    }

    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    // R6: Last Super Admin check
    await this.assertNotLastSuperAdmin(user, []);

    user.status = UserStatus.INACTIVE;
    user.isActive = false;
    await user.save();

    // R11: Immediately revoke all open refresh sessions
    await this.tokenService.revokeAllForUser(id);

    await this.auditService.log({
      event: AuditEvent.USER_DEACTIVATED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: { targetUserId: id, targetEmail: user.email },
    });

    return { success: true, message: `Staff member ${user.name} has been deactivated and logged out` };
  }

  async softDelete(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    if (id === actor.id) {
      throw new ForbiddenException({
        code: 'SELF_MODIFICATION_FORBIDDEN',
        message: 'You cannot delete your own account',
      });
    }

    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    // R6: Last Super Admin check
    await this.assertNotLastSuperAdmin(user, []);

    user.deletedAt = new Date();
    user.deletedBy = actor.id;
    user.status = UserStatus.INACTIVE;
    user.isActive = false;
    await user.save();

    // R11: Revoke sessions immediately
    await this.tokenService.revokeAllForUser(id);

    await this.auditService.log({
      event: AuditEvent.USER_DELETED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: { targetUserId: id, targetEmail: user.email, name: user.name },
    });

    return { success: true, message: `Staff member ${user.name} has been deleted` };
  }

  async resetPassword(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    await this.passwordManagementService.requestReset(user.email, {
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
    });

    await this.auditService.log({
      event: AuditEvent.USER_PASSWORD_RESET_SENT,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: { targetUserId: id, targetEmail: user.email },
    });

    return { success: true, message: `Password reset instructions sent to ${user.email}` };
  }

  async revokeSessions(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }) {
    const user = await this.userModel.findOne({ _id: id, deletedAt: { $exists: false } });
    if (!user) {
      throw new NotFoundException({ code: 'USER_NOT_FOUND', message: 'Staff member not found' });
    }

    await this.tokenService.revokeAllForUser(id);

    await this.auditService.log({
      event: AuditEvent.LOGOUT_ALL,
      userId: id,
      email: user.email,
      actorId: actor.id,
      actorEmail: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: { targetUserId: id, targetEmail: user.email, forcedByAdmin: true },
    });

    return { success: true, message: `All active sessions revoked for ${user.email}` };
  }

  /**
   * Enforces R6: At least one active Super Admin must always remain.
   */
  private async assertNotLastSuperAdmin(targetUser: UserDocument, proposedRoleIds: string[]) {
    const superAdminRole = await this.roleModel.findOne({ key: 'super_admin' });
    if (!superAdminRole) return;

    const superAdminRoleId = superAdminRole._id.toString();
    const hasSuperAdminNow =
      targetUser.roleIds?.includes(superAdminRoleId) || targetUser.role === 'SUPER_ADMIN';

    if (!hasSuperAdminNow) {
      return; // Not a super admin, so no danger of dropping the count
    }

    const proposedKeepsSuperAdmin = proposedRoleIds.includes(superAdminRoleId);
    if (proposedKeepsSuperAdmin && targetUser.status === UserStatus.ACTIVE) {
      return; // Keeps super admin role and stays active
    }

    // Count how many active super admins exist (excluding this target user)
    const activeSuperAdminsCount = await this.userModel.countDocuments({
      _id: { $ne: targetUser._id },
      deletedAt: { $exists: false },
      status: UserStatus.ACTIVE,
      $or: [
        { roleIds: superAdminRoleId },
        { role: UserRole.SUPER_ADMIN },
      ],
    });

    if (activeSuperAdminsCount === 0) {
      throw new BadRequestException({
        code: 'LAST_SUPER_ADMIN',
        message: 'Cannot demote, deactivate, or delete the last remaining active Super Administrator on the platform.',
      });
    }
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
        message: 'You cannot assign a role granting permissions you do not hold',
      });
    }
  }
}
