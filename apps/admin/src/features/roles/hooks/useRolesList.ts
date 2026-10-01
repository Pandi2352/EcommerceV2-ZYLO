import { useMemo } from 'react';
import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import { rolesService, type Role } from '../../../services/roles.service';
import { toItems } from '../lib/roleRules';

export const ROLES_PAGE_SIZE = 15;

type RolesParam = 'q' | 'status' | 'size';

/** Roles list with URL-backed status/search filters and client-side paging. */
export function useRolesList() {
  const params = useQueryState<RolesParam>();
  const q = params.get('q');
  const status = params.get('status');
  const pageSize = Number(params.get('size')) || ROLES_PAGE_SIZE;

  const query = useApiQuery(() => rolesService.listRoles(), []);
  const all = useMemo(() => toItems<Role>(query.data), [query.data]);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    return all.filter(
      (r) =>
        (!status || r.status === status) &&
        (!term || `${r.name} ${r.key} ${r.description ?? ''}`.toLowerCase().includes(term)),
    );
  }, [all, q, status]);

  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const page = Math.min(params.page, lastPage);
  const rows = useMemo(() => filtered.slice((page - 1) * pageSize, page * pageSize), [filtered, page, pageSize]);

  const counts = useMemo(
    () => ({
      active: all.filter((r) => r.status === 'ACTIVE').length,
      inactive: all.filter((r) => r.status === 'INACTIVE').length,
    }),
    [all],
  );

  return {
    all,
    rows: query.data ? rows : null,
    filteredTotal: filtered.length,
    total: query.data ? all.length : undefined,
    counts,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
    filters: { q, status },
    page,
    pageSize,
    hasFilters: Boolean(q || status),
    setFilter: (key: 'q' | 'status', value: string) => params.set({ [key]: value }),
    clearFilters: () => params.set({ q: null, status: null }),
    setPage: (next: number) => params.set({ page: next }),
    setPageSize: (next: number) => params.set({ size: next }),
  };
}

export type RolesListState = ReturnType<typeof useRolesList>;
