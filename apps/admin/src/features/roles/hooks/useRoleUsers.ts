import { useState } from 'react';
import { api, unwrap } from '@shared/api/client';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import type { RoleUserItem } from '../../../services/roles.service';

/** What GET /admin/roles/:id/users actually returns per user (superset of RoleUserItem). */
export interface RoleHolder extends Omit<RoleUserItem, 'joinedAt'> {
  name?: string;
  lastLoginAt?: string;
  mfaEnabled?: boolean;
  createdAt?: string;
  joinedAt?: string;
}

interface RoleHoldersPage {
  items: RoleHolder[];
  meta?: { total: number; page: number; limit: number };
}

export const ROLE_USERS_PAGE_SIZE = 15;

/**
 * Paginated holders of a role. Uses the same endpoint as
 * `rolesService.getRoleUsers`, passing the page/limit the server supports.
 */
export function useRoleUsers(roleId: string | undefined, enabled: boolean) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(ROLE_USERS_PAGE_SIZE);

  const query = useApiQuery<RoleHoldersPage | null>(
    () =>
      roleId && enabled
        ? unwrap<RoleHoldersPage | RoleHolder[]>(api.get(`/admin/roles/${roleId}/users`, { params: { page, limit: pageSize } })).then(
            (res) => (Array.isArray(res) ? { items: res } : res),
          )
        : Promise.resolve(null),
    [roleId, enabled, page, pageSize],
  );

  const items = query.data?.items ?? null;
  return {
    users: items,
    total: query.data?.meta?.total ?? items?.length ?? 0,
    page,
    pageSize,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
    setPage,
    setPageSize: (size: number) => {
      setPageSize(size);
      setPage(1);
    },
  };
}

export type RoleUsersState = ReturnType<typeof useRoleUsers>;
