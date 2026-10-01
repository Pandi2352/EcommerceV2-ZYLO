import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import type { AuthPortal } from '@shared/types/auth';
import { auditService } from '../../../services/audit.service';

export const AUDIT_PAGE_SIZE = 25;
export const AUDIT_PAGE_SIZES = [10, 25, 50, 100];

type AuditParam = 'event' | 'portal' | 'email' | 'size';

/** URL-backed filters and paging for the security log. */
export function useAuditLogs() {
  const params = useQueryState<AuditParam>();
  const event = params.get('event');
  const portal = params.get('portal') as AuthPortal | '';
  const email = params.get('email');
  const pageSize = Number(params.get('size')) || AUDIT_PAGE_SIZE;
  const { page } = params;

  const list = useApiQuery(
    () =>
      auditService.list({
        page,
        limit: pageSize,
        event: event || undefined,
        portal: portal || undefined,
        email: email || undefined,
      }),
    [page, pageSize, event, portal, email],
  );

  return {
    items: list.data?.items ?? null,
    meta: list.data?.meta,
    isLoading: list.isLoading,
    error: list.error,
    reload: list.reload,
    filters: { event, portal, email },
    page,
    pageSize,
    hasFilters: Boolean(event || portal || email),
    setFilter: (key: 'event' | 'portal' | 'email', value: string) => params.set({ [key]: value }),
    clearFilters: () => params.set({ event: null, portal: null, email: null }),
    setPage: (next: number) => params.set({ page: next }),
    setPageSize: (next: number) => params.set({ size: next }),
  };
}

export type AuditLogsState = ReturnType<typeof useAuditLogs>;
