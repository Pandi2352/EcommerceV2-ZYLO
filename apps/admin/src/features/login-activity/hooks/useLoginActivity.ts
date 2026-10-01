import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import { loginActivityService, type LoginActivityQuery } from '../../../services/loginActivity.service';

export const LOGIN_ACTIVITY_PAGE_SIZE = 25;
export const LOGIN_ACTIVITY_PAGE_SIZES = [10, 25, 50, 100];

export type LoginStatusTab = 'all' | 'SUCCESS' | 'FAILED' | 'BLOCKED' | 'LOGOUT';
export type LoginRange = Exclude<NonNullable<LoginActivityQuery['range']>, 'all'>;

type LoginParam = 'status' | 'range' | 'q' | 'size';

const STATUSES: LoginStatusTab[] = ['all', 'SUCCESS', 'FAILED', 'BLOCKED', 'LOGOUT'];
const RANGES: LoginRange[] = ['today', '7d', '30d'];

/** URL-backed status tab, period, search and paging for the login activity list. */
export function useLoginActivity() {
  const params = useQueryState<LoginParam>();
  const rawStatus = params.get('status') as LoginStatusTab;
  const status: LoginStatusTab = STATUSES.includes(rawStatus) ? rawStatus : 'all';
  const rawRange = params.get('range') as LoginRange;
  const range: LoginRange | '' = RANGES.includes(rawRange) ? rawRange : '';
  const q = params.get('q');
  const pageSize = Number(params.get('size')) || LOGIN_ACTIVITY_PAGE_SIZE;
  const { page } = params;

  const list = useApiQuery(
    () =>
      loginActivityService.getLoginActivity({
        page,
        limit: pageSize,
        status: status === 'all' ? undefined : status,
        range: range || 'all',
        q: q.trim() || undefined,
      }),
    [page, pageSize, status, range, q],
  );

  return {
    items: list.data?.items ?? null,
    total: list.data?.total,
    stats: list.data?.stats,
    isLoading: list.isLoading,
    error: list.error,
    reload: list.reload,
    status,
    filters: { range, q },
    page,
    pageSize,
    hasFilters: Boolean(range || q),
    setStatus: (next: LoginStatusTab) => params.set({ status: next === 'all' ? null : next }),
    setRange: (next: LoginRange | '') => params.set({ range: next }),
    setQuery: (next: string) => params.set({ q: next }),
    clearFilters: () => params.set({ range: null, q: null }),
    resetAll: () => params.set({ status: null, range: null, q: null }),
    setPage: (next: number) => params.set({ page: next }),
    setPageSize: (next: number) => params.set({ size: next }),
  };
}

export type LoginActivityState = ReturnType<typeof useLoginActivity>;
