import type { Role } from '../../../services/roles.service';

export const isSuperAdminRole = (role: Pick<Role, 'key'>) => role.key === 'super_admin';

export const hasAllPermissions = (role: Pick<Role, 'key' | 'permissions'>) =>
  isSuperAdminRole(role) || role.permissions.includes('*');

/** "All" for wildcard roles, otherwise the number of granted keys. */
export const permissionCountLabel = (role: Pick<Role, 'key' | 'permissions'>) =>
  hasAllPermissions(role) ? 'All' : String(role.permissions.length);

export const pluralize = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

export interface RoleRestrictions {
  /** Why the action is unavailable; null when allowed */
  edit: string | null;
  status: string | null;
  delete: string | null;
}

/** Server rules R2/R3 mirrored in the UI so blocked actions explain themselves. */
export function roleRestrictions(role: Role): RoleRestrictions {
  const users = role.userCount ?? 0;
  const superAdmin = isSuperAdminRole(role);
  return {
    edit: superAdmin ? "The Super Admin role can't be edited" : null,
    status: superAdmin
      ? "The Super Admin role can't be deactivated"
      : role.isSystem && role.status === 'ACTIVE'
        ? "System roles can't be deactivated"
        : null,
    delete: role.isSystem
      ? "System roles can't be deleted"
      : users > 0
        ? `Assigned to ${pluralize(users, 'user')}; reassign them first`
        : null,
  };
}

/** Accepts both `{ items }` and bare-array list responses. */
export function toItems<T>(res: unknown): T[] {
  if (Array.isArray(res)) return res as T[];
  const items = (res as { items?: unknown })?.items;
  return Array.isArray(items) ? (items as T[]) : [];
}
