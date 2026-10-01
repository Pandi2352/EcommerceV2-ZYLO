import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleStatus } from './schemas/role.schema';
import { User, UserDocument } from '../users/schemas/user.schema';
import { StaffInvitation, StaffInvitationDocument, InvitationStatus } from '../invitations/schemas/staff-invitation.schema';
import { PermissionsService } from '../permissions/permissions.service';
import { PermissionResolverService } from '../../common/authorization/permission-resolver.service';
import { AuditService } from '../audit/audit.service';
import { AuditEvent } from '../audit/audit-event.enum';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RoleQueryDto } from './dto/role-query.dto';

export interface RoleWithCounts {
  id: string;
  name: string;
  key: string;
  description: string;
  permissions: string[];
  status: RoleStatus;
  isSystem: boolean;
  userCount: number;
  permissionCount: number;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class RolesService {
  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
    @InjectModel(StaffInvitation.name)
    private readonly invitationModel: Model<StaffInvitationDocument>,
    private readonly permissionsService: PermissionsService,
    private readonly permissionResolver: PermissionResolverService,
    private readonly auditService: AuditService,
  ) {}

  async list(query: RoleQueryDto): Promise<{ items: RoleWithCounts[]; meta: { total: number; page: number; limit: number; totalPages: number } }> {
    const filter: Record<string, any> = {};

    if (query.status) {
      filter.status = query.status;
    }

    if (query.q && query.q.trim()) {
      const escaped = query.q.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      filter.$or = [
        { name: { $regex: escaped, $options: 'i' } },
        { key: { $regex: escaped, $options: 'i' } },
      ];
    }

    const total = await this.roleModel.countDocuments(filter);
    const page = Math.max(1, query.page || 1);
    const limit = Math.min(100, Math.max(1, query.limit || 20));
    const skip = (page - 1) * limit;

    const roles = await this.roleModel
      .find(filter)
      .sort({ isSystem: -1, name: 1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const items: RoleWithCounts[] = await Promise.all(
      roles.map(async (r) => {
        const userCount = await this.userModel.countDocuments({
          roleIds: r._id.toString(),
          deletedAt: { $exists: false },
        });
        const permissionCount = r.permissions.includes('*') ? 48 : r.permissions.length;

        return {
          id: r._id.toString(),
          name: r.name,
          key: r.key,
          description: r.description,
          permissions: r.permissions,
          status: r.status,
          isSystem: r.isSystem,
          userCount,
          permissionCount,
          createdBy: r.createdBy,
          updatedBy: r.updatedBy,
          createdAt: r.createdAt,
          updatedAt: r.updatedAt,
        };
      }),
    );

    return {
      items,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async getById(id: string): Promise<RoleWithCounts> {
    const r = await this.roleModel.findById(id).lean();
    if (!r) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found' });
    }

    const userCount = await this.userModel.countDocuments({
      roleIds: r._id.toString(),
      deletedAt: { $exists: false },
    });
    const permissionCount = r.permissions.includes('*') ? 48 : r.permissions.length;

    return {
      id: r._id.toString(),
      name: r.name,
      key: r.key,
      description: r.description,
      permissions: r.permissions,
      status: r.status,
      isSystem: r.isSystem,
      userCount,
      permissionCount,
      createdBy: r.createdBy,
      updatedBy: r.updatedBy,
      createdAt: r.createdAt,
      updatedAt: r.updatedAt,
    };
  }

  async create(dto: CreateRoleDto, actor: any, reqMeta?: { ip?: string; userAgent?: string }): Promise<RoleWithCounts> {
    // Generate or format key
    let key = dto.key?.trim().toLowerCase();
    if (!key) {
      key = dto.name
        .trim()
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }

    // Check unique key
    const existingKey = await this.roleModel.findOne({ key });
    if (existingKey) {
      throw new ConflictException({
        code: 'ROLE_KEY_TAKEN',
        message: `Role key "${key}" is already taken`,
      });
    }

    // Check unique name
    const existingName = await this.roleModel.findOne({ name: dto.name.trim() }).collation({ locale: 'en', strength: 2 });
    if (existingName) {
      throw new ConflictException({
        code: 'ROLE_NAME_TAKEN',
        message: `Role name "${dto.name.trim()}" is already in use`,
      });
    }

    let permissions = dto.permissions || [];
    if (dto.copyFromRoleId) {
      const source = await this.roleModel.findById(dto.copyFromRoleId);
      if (source && source.permissions) {
        permissions = Array.from(new Set([...permissions, ...source.permissions.filter((p) => p !== '*')]));
      }
    }

    // R4: Validate permissions against catalog
    const activeKeys = await this.permissionsService.getAllActiveKeys();
    const activeKeySet = new Set(activeKeys);
    for (const p of permissions) {
      if (!activeKeySet.has(p)) {
        throw new BadRequestException({
          code: 'UNKNOWN_PERMISSION',
          message: `Unknown or deprecated permission key: "${p}"`,
        });
      }
    }

    // R5: Escalation check
    this.assertNoEscalation(actor, permissions);

    const doc = await this.roleModel.create({
      name: dto.name.trim(),
      key,
      description: dto.description?.trim() || '',
      permissions,
      status: RoleStatus.ACTIVE,
      isSystem: false,
      createdBy: actor.id,
    });

    await this.auditService.log({
      event: AuditEvent.ROLE_CREATED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        roleId: doc._id.toString(),
        name: doc.name,
        key: doc.key,
        permissionsCount: permissions.length,
      },
    });

    return this.getById(doc._id.toString());
  }

  async update(id: string, dto: UpdateRoleDto, actor: any, reqMeta?: { ip?: string; userAgent?: string }): Promise<RoleWithCounts> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found' });
    }

    // R2: super_admin cannot be edited or deactivated
    if (role.key === 'super_admin') {
      throw new ForbiddenException({
        code: 'ROLE_SYSTEM_PROTECTED',
        message: 'The Super Admin role cannot be modified or deactivated',
      });
    }

    const changes: Record<string, any> = {};

    if (dto.name && dto.name.trim() !== role.name) {
      const conflict = await this.roleModel
        .findOne({ _id: { $ne: role._id }, name: dto.name.trim() })
        .collation({ locale: 'en', strength: 2 });
      if (conflict) {
        throw new ConflictException({
          code: 'ROLE_NAME_TAKEN',
          message: `Role name "${dto.name.trim()}" is already in use`,
        });
      }
      changes.name = { from: role.name, to: dto.name.trim() };
      role.name = dto.name.trim();
    }

    if (dto.description !== undefined && dto.description.trim() !== role.description) {
      changes.description = { from: role.description, to: dto.description.trim() };
      role.description = dto.description.trim();
    }

    if (dto.status && dto.status !== role.status) {
      // System roles cannot be deactivated
      if (role.isSystem && dto.status === RoleStatus.INACTIVE) {
        throw new ForbiddenException({
          code: 'ROLE_SYSTEM_PROTECTED',
          message: 'System roles cannot be deactivated',
        });
      }
      changes.status = { from: role.status, to: dto.status };
      role.status = dto.status;
    }

    role.updatedBy = actor.id;
    await role.save();

    this.permissionResolver.invalidateRole(id);

    if (Object.keys(changes).length > 0) {
      await this.auditService.log({
        event: AuditEvent.ROLE_UPDATED,
        userId: actor.id,
        email: actor.email,
        ip: reqMeta?.ip || '',
        userAgent: reqMeta?.userAgent || '',
        metadata: {
          roleId: id,
          changes,
        },
      });
    }

    return this.getById(id);
  }

  async assignPermissions(
    id: string,
    permissions: string[],
    actor: any,
    reqMeta?: { ip?: string; userAgent?: string },
  ): Promise<{ role: RoleWithCounts; diff: { added: string[]; removed: string[] } }> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found' });
    }

    // R2: super_admin permissions are immutable '*'
    if (role.key === 'super_admin') {
      throw new ForbiddenException({
        code: 'ROLE_SYSTEM_PROTECTED',
        message: 'Super Admin permissions are fixed and cannot be changed',
      });
    }

    // R4: Validate permissions against catalog
    const activeKeys = await this.permissionsService.getAllActiveKeys();
    const activeKeySet = new Set(activeKeys);
    for (const p of permissions) {
      if (!activeKeySet.has(p)) {
        throw new BadRequestException({
          code: 'UNKNOWN_PERMISSION',
          message: `Unknown or deprecated permission key: "${p}"`,
        });
      }
    }

    // Automatically ensure implied view permission for each module
    const targetSet = new Set(permissions);
    for (const p of permissions) {
      const dot = p.indexOf('.');
      if (dot > 0) {
        targetSet.add(`${p.slice(0, dot)}.view`);
      }
    }
    const finalPermissions = Array.from(targetSet);

    // R5: Escalation check
    this.assertNoEscalation(actor, finalPermissions);

    const prev = role.permissions || [];
    const added = finalPermissions.filter((p) => !prev.includes(p));
    const removed = prev.filter((p) => !finalPermissions.includes(p));

    role.permissions = finalPermissions;
    role.updatedBy = actor.id;
    await role.save();

    this.permissionResolver.invalidateRole(id);

    await this.auditService.log({
      event: AuditEvent.ROLE_PERMISSIONS_UPDATED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        roleId: id,
        roleName: role.name,
        added,
        removed,
        totalPermissions: finalPermissions.length,
      },
    });

    const updatedRole = await this.getById(id);
    return { role: updatedRole, diff: { added, removed } };
  }

  async getRoleUsers(id: string, page = 1, limit = 20) {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found' });
    }

    const filter = {
      roleIds: id,
      deletedAt: { $exists: false },
    };

    const total = await this.userModel.countDocuments(filter);
    const users = await this.userModel
      .find(filter)
      .select('name firstName lastName email userCode designation status lastLoginAt mfaEnabled createdAt')
      .sort({ name: 1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    return {
      items: users.map((u) => ({
        id: u._id.toString(),
        name: u.name,
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        userCode: u.userCode,
        designation: u.designation,
        status: u.status,
        lastLoginAt: u.lastLoginAt,
        mfaEnabled: u.mfaEnabled,
        createdAt: u.createdAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit) || 1,
      },
    };
  }

  async delete(id: string, actor: any, reqMeta?: { ip?: string; userAgent?: string }): Promise<{ success: boolean; message: string }> {
    const role = await this.roleModel.findById(id);
    if (!role) {
      throw new NotFoundException({ code: 'ROLE_NOT_FOUND', message: 'Role not found' });
    }

    // R2: System roles cannot be deleted
    if (role.isSystem) {
      throw new ForbiddenException({
        code: 'ROLE_SYSTEM_PROTECTED',
        message: 'System-seeded roles cannot be deleted',
      });
    }

    // R1: Check if role is assigned to any active user or pending invitation
    const userCount = await this.userModel.countDocuments({
      roleIds: id,
      deletedAt: { $exists: false },
    });

    const invitationCount = await this.invitationModel.countDocuments({
      roleIds: id,
      status: InvitationStatus.INVITED,
    });

    if (userCount > 0 || invitationCount > 0) {
      throw new BadRequestException({
        code: 'ROLE_IN_USE',
        message: `Cannot delete role "${role.name}" because it is currently assigned to ${userCount} staff member(s) and ${invitationCount} open invitation(s). Please reassign or deactivate the role first.`,
        details: { userCount, invitationCount },
      });
    }

    await this.roleModel.deleteOne({ _id: id });
    this.permissionResolver.invalidateRole(id);

    await this.auditService.log({
      event: AuditEvent.ROLE_DELETED,
      userId: actor.id,
      email: actor.email,
      ip: reqMeta?.ip || '',
      userAgent: reqMeta?.userAgent || '',
      metadata: {
        roleId: id,
        name: role.name,
        key: role.key,
      },
    });

    return { success: true, message: `Role "${role.name}" was successfully deleted` };
  }

  /**
   * Enforces R5: Privilege escalation check.
   * Actor can only assign permissions they personally hold (unless they are Super Admin / hold '*').
   */
  private assertNoEscalation(actor: any, targetPermissions: string[]) {
    const actorPerms: string[] = actor.permissions || [];
    if (actorPerms.includes('*')) {
      return;
    }

    const unheld = targetPermissions.filter((p) => !actorPerms.includes(p));
    if (unheld.length > 0) {
      throw new ForbiddenException({
        code: 'PRIVILEGE_ESCALATION',
        message: `You cannot grant permissions you do not hold yourself: ${unheld.join(', ')}`,
        unheld,
      });
    }
  }
}
