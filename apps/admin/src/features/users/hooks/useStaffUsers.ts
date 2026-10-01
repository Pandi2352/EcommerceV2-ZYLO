import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import type { TableSort } from '@shared/ui/DataTable';
import { staffUsersService } from '../../../services/staffUsers.service';

export const USERS_PAGE_SIZE = 15;

type UsersParam = 'q' | 'role' | 'status' | 'sort' | 'size';

/** URL-backed filters + the staff user list they select. */
export function useStaffUsers() {
  const params = useQueryState<UsersParam>();
  const q = params.get('q');
  const role = params.get('role');
  const status = params.get('status');
  const sortParam = params.get('sort');
  const pageSize = Number(params.get('size')) || USERS_PAGE_SIZE;
  const { page } = params;

  const list = useApiQuery(
    () =>
      staffUsersService.list({
        page,
        limit: pageSize,
        q: q.trim() || undefined,
        roleId: role || undefined,
        status: status || undefined,
        sort: sortParam || undefined,
      }),
    [page, pageSize, q, role, status, sortParam],
  );

  const sort: TableSort | null = sortParam
    ? { key: sortParam.replace(/^-/, ''), direction: sortParam.startsWith('-') ? 'desc' : 'asc' }
    : null;

  return {
    users: list.data?.items ?? null,
    meta: list.data?.meta,
    stats: list.data?.stats,
    isLoading: list.isLoading,
    error: list.error,
    reload: list.reload,
    filters: { q, role, status },
    sort,
    page,
    pageSize,
    hasFilters: Boolean(q || role || status),
    setFilter: (key: 'q' | 'role' | 'status', value: string) => params.set({ [key]: value }),
    clearFilters: () => params.set({ q: null, role: null, status: null }),
    setSort: (next: TableSort | null) =>
      params.set({ sort: next ? `${next.direction === 'desc' ? '-' : ''}${next.key}` : null }),
    setPage: (next: number) => params.set({ page: next }),
    setPageSize: (next: number) => params.set({ size: next }),
  };
}

export type StaffUsersState = ReturnType<typeof useStaffUsers>;
