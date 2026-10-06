import { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productsService } from '@shared/api/products.service';
import type { ProductItem, ProductFacets, QueryProductParams } from '@shared/types/product';

export type ViewMode = 'grid' | 'list';

export interface ShopFilters {
  search: string;
  categoryIds: string[];
  brandIds: string[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  minRating?: number;
  sortBy: string;
  page: number;
}

export function useShopProducts(pageSize = 12) {
  const [searchParams, setSearchParams] = useSearchParams();

  const [products, setProducts] = useState<ProductItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [facets, setFacets] = useState<ProductFacets | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFacetsLoading, setIsFacetsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    return (localStorage.getItem('zylo_shop_view_mode') as ViewMode) || 'grid';
  });

  const setStoredViewMode = (mode: ViewMode) => {
    setViewMode(mode);
    localStorage.setItem('zylo_shop_view_mode', mode);
  };

  // Extract parsed filters from URL search params
  const filters: ShopFilters = useMemo(() => {
    const search = searchParams.get('search') || '';
    const rawCategoryIds = searchParams.get('categoryIds') || searchParams.get('categoryId') || '';
    const categoryIds = rawCategoryIds ? rawCategoryIds.split(',').filter(Boolean) : [];
    const rawBrandIds = searchParams.get('brandIds') || searchParams.get('brandId') || '';
    const brandIds = rawBrandIds ? rawBrandIds.split(',').filter(Boolean) : [];
    const minPriceRaw = searchParams.get('minPrice');
    const maxPriceRaw = searchParams.get('maxPrice');
    const minPrice = minPriceRaw ? Number(minPriceRaw) : undefined;
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;
    const inStockOnly = searchParams.get('inStockOnly') === 'true';
    const minRatingRaw = searchParams.get('minRating');
    const minRating = minRatingRaw ? Number(minRatingRaw) : undefined;
    const sortBy = searchParams.get('sortBy') || 'newest';
    const pageRaw = searchParams.get('page');
    const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10)) : 1;

    return {
      search,
      categoryIds,
      brandIds,
      minPrice,
      maxPrice,
      inStockOnly,
      minRating,
      sortBy,
      page,
    };
  }, [searchParams]);

  // Initial load of facets (categories, brands with counts, price min/max, inStock count)
  const fetchFacets = useCallback(async () => {
    try {
      setIsFacetsLoading(true);
      const res = await productsService.getFacets();
      setFacets(res);
      return res;
    } catch (err) {
      console.error('Failed to load catalog facets:', err);
      return null;
    } finally {
      setIsFacetsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacets();
  }, [fetchFacets]);

  // Handle categoryName if passed from navbar category dropdown
  useEffect(() => {
    const categoryName = searchParams.get('categoryName');
    if (categoryName && facets?.categories) {
      const matched = facets.categories.find(
        (c) => c.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (matched && !filters.categoryIds.includes(matched.id)) {
        const nextParams = new URLSearchParams(searchParams);
        nextParams.delete('categoryName');
        nextParams.set('categoryIds', matched.id);
        nextParams.set('page', '1');
        setSearchParams(nextParams, { replace: true });
      }
    }
  }, [facets, searchParams, filters.categoryIds, setSearchParams]);

  // Fetch products matching current filters
  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);

      const queryParams: QueryProductParams = {
        page: filters.page,
        limit: pageSize,
        sortBy: filters.sortBy as any,
      };

      if (filters.search) queryParams.search = filters.search;
      if (filters.categoryIds.length > 0) queryParams.categoryIds = filters.categoryIds.join(',');
      if (filters.brandIds.length > 0) queryParams.brandIds = filters.brandIds.join(',');
      if (filters.minPrice !== undefined) queryParams.minPrice = filters.minPrice;
      if (filters.maxPrice !== undefined) queryParams.maxPrice = filters.maxPrice;
      if (filters.inStockOnly) queryParams.inStockOnly = true;
      if (filters.minRating !== undefined) queryParams.minRating = filters.minRating;

      const res = await productsService.getPublicProducts(queryParams);
      setProducts(res.items || []);
      setTotal(res.total || 0);
      setTotalPages(res.totalPages || 1);
    } catch (err) {
      console.error('Failed to fetch storefront products:', err);
      setProducts([]);
      setTotal(0);
      setTotalPages(1);
    } finally {
      setIsLoading(false);
    }
  }, [filters, pageSize]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Update URL helper
  const updateParams = useCallback(
    (updater: (params: URLSearchParams) => void) => {
      const next = new URLSearchParams(searchParams);
      updater(next);
      setSearchParams(next, { replace: true });
    },
    [searchParams, setSearchParams]
  );

  const setSearch = useCallback(
    (search: string) => {
      updateParams((p) => {
        if (search.trim()) {
          p.set('search', search.trim());
        } else {
          p.delete('search');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const toggleCategory = useCallback(
    (categoryId: string) => {
      updateParams((p) => {
        const current = p.get('categoryIds') ? p.get('categoryIds')!.split(',').filter(Boolean) : [];
        let updated: string[];
        if (current.includes(categoryId)) {
          updated = current.filter((id) => id !== categoryId);
        } else {
          updated = [...current, categoryId];
        }
        if (updated.length > 0) {
          p.set('categoryIds', updated.join(','));
        } else {
          p.delete('categoryIds');
          p.delete('categoryId');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const toggleBrand = useCallback(
    (brandId: string) => {
      updateParams((p) => {
        const current = p.get('brandIds') ? p.get('brandIds')!.split(',').filter(Boolean) : [];
        let updated: string[];
        if (current.includes(brandId)) {
          updated = current.filter((id) => id !== brandId);
        } else {
          updated = [...current, brandId];
        }
        if (updated.length > 0) {
          p.set('brandIds', updated.join(','));
        } else {
          p.delete('brandIds');
          p.delete('brandId');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const setPriceRange = useCallback(
    (min?: number, max?: number) => {
      updateParams((p) => {
        if (min !== undefined && min > 0) {
          p.set('minPrice', String(min));
        } else {
          p.delete('minPrice');
        }
        if (max !== undefined && max > 0) {
          p.set('maxPrice', String(max));
        } else {
          p.delete('maxPrice');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const setInStockOnly = useCallback(
    (inStock: boolean) => {
      updateParams((p) => {
        if (inStock) {
          p.set('inStockOnly', 'true');
        } else {
          p.delete('inStockOnly');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const setMinRating = useCallback(
    (rating?: number) => {
      updateParams((p) => {
        if (rating !== undefined && rating > 0) {
          p.set('minRating', String(rating));
        } else {
          p.delete('minRating');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const setSortBy = useCallback(
    (sort: string) => {
      updateParams((p) => {
        p.set('sortBy', sort);
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const setPage = useCallback(
    (pageNumber: number) => {
      updateParams((p) => {
        p.set('page', String(pageNumber));
      });
    },
    [updateParams]
  );

  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams(), { replace: true });
  }, [setSearchParams]);

  const removeFilter = useCallback(
    (key: keyof ShopFilters, value?: string) => {
      updateParams((p) => {
        if (key === 'categoryIds' && value) {
          const current = p.get('categoryIds') ? p.get('categoryIds')!.split(',').filter(Boolean) : [];
          const updated = current.filter((id) => id !== value);
          if (updated.length > 0) {
            p.set('categoryIds', updated.join(','));
          } else {
            p.delete('categoryIds');
            p.delete('categoryId');
          }
        } else if (key === 'brandIds' && value) {
          const current = p.get('brandIds') ? p.get('brandIds')!.split(',').filter(Boolean) : [];
          const updated = current.filter((id) => id !== value);
          if (updated.length > 0) {
            p.set('brandIds', updated.join(','));
          } else {
            p.delete('brandIds');
            p.delete('brandId');
          }
        } else if (key === 'search') {
          p.delete('search');
        } else if (key === 'minPrice' || key === 'maxPrice') {
          p.delete('minPrice');
          p.delete('maxPrice');
        } else if (key === 'inStockOnly') {
          p.delete('inStockOnly');
        } else if (key === 'minRating') {
          p.delete('minRating');
        }
        p.set('page', '1');
      });
    },
    [updateParams]
  );

  const hasActiveFilters = useMemo(() => {
    return Boolean(
      filters.search ||
        filters.categoryIds.length > 0 ||
        filters.brandIds.length > 0 ||
        filters.minPrice !== undefined ||
        filters.maxPrice !== undefined ||
        filters.inStockOnly ||
        filters.minRating !== undefined
    );
  }, [filters]);

  return {
    products,
    total,
    totalPages,
    facets,
    isLoading,
    isFacetsLoading,
    filters,
    viewMode,
    setViewMode: setStoredViewMode,
    hasActiveFilters,
    setSearch,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setInStockOnly,
    setMinRating,
    setSortBy,
    setPage,
    resetFilters,
    removeFilter,
    refetch: fetchProducts,
  };
}
