import { useApiQuery } from '@shared/hooks/useApiQuery';
import { useQueryState } from '@shared/hooks/useQueryState';
import { userOverviewService, type OverviewPeriod } from '../../../services/userOverview.service';

export const PERIODS: { value: `${OverviewPeriod}`; label: string }[] = [
  { value: '7', label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
];

/** Overview data for the selected period (kept in the URL as ?days=). */
export function useUserOverview() {
  const params = useQueryState<'days'>();
  const raw = params.get('days');
  const days: OverviewPeriod = raw === '7' || raw === '90' ? Number(raw) as OverviewPeriod : 30;

  const query = useApiQuery(() => userOverviewService.get(days), [days]);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
    days,
    setDays: (next: string) => params.set({ days: next === '30' || !next ? null : next }),
  };
}
