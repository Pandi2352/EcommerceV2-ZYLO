import { useState, useEffect, useCallback } from 'react';
import { productsService } from '@shared/api/products.service';
import type { ProductOverviewData } from '@shared/types/product';

export function useProductsOverview() {
  const [data, setData] = useState<ProductOverviewData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchOverview = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await productsService.getOverview();
      setData(res);
    } catch (err: any) {
      console.error('Failed to load products overview:', err);
      setError(err instanceof Error ? err : new Error(err?.message || 'Failed to fetch catalog overview'));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  return {
    data,
    isLoading,
    error,
    reload: fetchOverview,
  };
}
