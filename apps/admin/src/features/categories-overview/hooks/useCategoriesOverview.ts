import { useApiQuery } from '@shared/hooks/useApiQuery';
import { categoriesOverviewService, type CategoryOverviewData } from '../../../services/categoriesOverview.service';

/** Hook to fetch and reload Category Overview aggregated data */
export function useCategoriesOverview() {
  const query = useApiQuery<CategoryOverviewData>(() => categoriesOverviewService.get(), []);

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    reload: query.reload,
  };
}
