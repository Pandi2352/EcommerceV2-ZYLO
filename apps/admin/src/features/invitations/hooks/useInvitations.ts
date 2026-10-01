import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import { invitationsService, type InvitationStatus } from '../../../services/invitations.service';

export const INVITATIONS_PAGE_SIZE = 15;

export type InvitationTab = '' | InvitationStatus;

const STATUSES: InvitationStatus[] = ['INVITED', 'EXPIRED', 'REVOKED', 'REGISTERED'];

type InvitationsParam = 'q' | 'role' | 'status' | 'size';

/** URL-backed tab, filters and paging + the invitation list they select. */
export function useInvitations() {
  const params = useQueryState<InvitationsParam>();
  const q = params.get('q');
  const role = params.get('role');
  const rawStatus = params.get('status');
  const status: InvitationTab = STATUSES.includes(rawStatus as InvitationStatus) ? (rawStatus as InvitationStatus) : '';
  const pageSize = Number(params.get('size')) || INVITATIONS_PAGE_SIZE;
  const { page } = params;

  const list = useApiQuery(
    () =>
      invitationsService.listInvitations({
        page,
        limit: pageSize,
        status: status || undefined,
        roleId: role || undefined,
        q: q.trim() || undefined,
      }),
    [page, pageSize, status, role, q],
  );

  return {
    invitations: list.data?.items ?? null,
    meta: list.data?.meta,
    stats: list.data?.stats,
    isLoading: list.isLoading,
    error: list.error,
    reload: list.reload,
    filters: { q, role },
    status,
    page,
    pageSize,
    /** Toolbar filters only; the status tab is not a "filter" to clear */
    hasFilters: Boolean(q || role),
    setStatus: (next: InvitationTab) => params.set({ status: next }),
    setFilter: (key: 'q' | 'role', value: string) => params.set({ [key]: value }),
    clearFilters: () => params.set({ q: null, role: null }),
    setPage: (next: number) => params.set({ page: next }),
    setPageSize: (next: number) => params.set({ size: next }),
  };
}

export type InvitationsState = ReturnType<typeof useInvitations>;
