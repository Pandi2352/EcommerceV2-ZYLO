import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Role, RoleDocument, RoleStatus } from '../../modules/roles/schemas/role.schema';
import { PermissionsService } from '../../modules/permissions/permissions.service';

interface CachedRole {
  id: string;
  key: string;
  name: string;
  status: RoleStatus;
  permissions: string[];
  isSystem: boolean;
  cachedAt: number;
}

@Injectable()
export class PermissionResolverService {
  private readonly logger = new Logger(PermissionResolverService.name);
  private readonly roleCache = new Map<string, CachedRole>();
  private readonly CACHE_TTL_MS = 60_000; // 60 seconds

  constructor(
    @InjectModel(Role.name)
    private readonly roleModel: Model<RoleDocument>,
    private readonly permissionsService: PermissionsService,
  ) {}

  /** Invalidate role cache when a role is updated or permissions changed */
  invalidateRole(roleId?: string) {
    if (roleId) {
      this.roleCache.delete(roleId);
    } else {
      this.roleCache.clear();
    }
  }

  async getRole(roleId: string): Promise<CachedRole | null> {
    const cached = this.roleCache.get(roleId);
    const now = Date.now();
    if (cached && now - cached.cachedAt < this.CACHE_TTL_MS) {
      return cached;
    }

    const doc = await this.roleModel.findById(roleId).lean();
    if (!doc) {
      return null;
    }

    const item: CachedRole = {
      id: doc._id.toString(),
      key: doc.key,
      name: doc.name,
      status: doc.status,
      permissions: doc.permissions || [],
      isSystem: doc.isSystem,
      cachedAt: now,
    };
    this.roleCache.set(roleId, item);
    return item;
  }

  /**
   * Resolves effective permissions for a user:
   * 1. Loads user's roles by roleIds
   * 2. Drops INACTIVE roles
   * 3. Unions permissions
   * 4. Expands '*' if super_admin to all active non-deprecated keys
   * 5. Injects implied 'view' permissions for every module that has any granted action
   */
  async forUser(roleIds: string[] = []): Promise<{
    permissions: string[];
    roles: { id: string; key: string; name: string }[];
  }> {
    if (!roleIds || roleIds.length === 0) {
      return { permissions: [], roles: [] };
    }

    const roles: CachedRole[] = [];
    for (const rId of roleIds) {
      const r = await this.getRole(rId);
      if (r && r.status === RoleStatus.ACTIVE) {
        roles.push(r);
      }
    }

    if (roles.length === 0) {
      return { permissions: [], roles: [] };
    }

    const hasWildcard = roles.some((r) => r.permissions.includes('*'));
    if (hasWildcard) {
      const allActiveKeys = await this.permissionsService.getAllActiveKeys();
      return {
        permissions: allActiveKeys,
        roles: roles.map((r) => ({ id: r.id, key: r.key, name: r.name })),
      };
    }

    const set = new Set<string>();
    for (const r of roles) {
      for (const p of r.permissions) {
        set.add(p);
      }
    }

    // Add implied 'view' permissions: if module.action is present, add module.view
    for (const key of Array.from(set)) {
      const dotIndex = key.indexOf('.');
      if (dotIndex > 0) {
        const module = key.slice(0, dotIndex);
        set.add(`${module}.view`);
      }
    }

    return {
      permissions: Array.from(set),
      roles: roles.map((r) => ({ id: r.id, key: r.key, name: r.name })),
    };
  }
}
