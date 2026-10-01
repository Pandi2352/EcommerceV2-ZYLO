import { useMemo } from 'react';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useAuth } from '@shared/auth/AuthContext';
import { staffUsersService } from '../../../../services/staffUsers.service';

export interface PermissionGroup {
  module: string;
  label: string;
  actions: string[];
}

/** "audit_logs" → "Audit logs" */
function moduleLabel(module: string): string {
  const text = module.replace(/_/g, ' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

/** Group "users.edit"-style keys by their module prefix, sorted by module. */
function groupPermissions(keys: string[]): PermissionGroup[] {
  const groups = new Map<string, string[]>();
  for (const key of keys) {
    const [module, ...rest] = key.split(/[.:]/);
    const action = rest.join('.') || module;
    groups.set(module, [...(groups.get(module) ?? []), action]);
  }
  return [...groups.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([module, actions]) => ({ module, label: moduleLabel(module), actions: actions.sort() }));
}

/** Loads one staff user's profile, effective permissions and recent activity. */
export function useUserDetails(id: string | undefined) {
  const { user: me } = useAuth();
  const query = useApiQuery(() => staffUsersService.getById(id ?? ''), [id]);
  const user = query.data && query.data.id === id ? query.data : null;

  const derived = useMemo(() => {
    const permissions = user?.effectivePermissions ?? [];
    const isSuperAdmin = user?.roleKey === 'super_admin' || Boolean(user?.roles?.some((r) => r.key === 'super_admin'));
    const hasWildcard = isSuperAdmin || permissions.includes('*');
    const keys = permissions.filter((p) => p !== '*');
    return {
      isSuperAdmin,
      hasWildcard,
      permissionCount: keys.length,
      permissionGroups: groupPermissions(keys),
    };
  }, [user]);

  return {
    user,
    isSelf: Boolean(user && me?.id === user.id),
    ...derived,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
  };
}

export type UserDetailsState = ReturnType<typeof useUserDetails>;
