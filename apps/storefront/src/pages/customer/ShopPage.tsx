import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronRight,
  PackageSearch,
  SlidersHorizontal,
  X,
  RotateCcw,
} from 'lucide-react';
import { ROUTES } from '../../routes/routePaths';
import type { ProductItem } from '@shared/types/product';
import Pagination from '@shared/ui/Pagination';
import Button from '@shared/ui/Button';

import { useShopProducts } from '../../features/shop/hooks/useShopProducts';
import { ShopToolbar } from '../../features/shop/components/ShopToolbar';
import { ShopFilterSidebar } from '../../features/shop/components/ShopFilterSidebar';
import { ActiveFilterChips } from '../../features/shop/components/ActiveFilterChips';
import { ProductCard } from '../../features/shop/components/ProductCard';
import { ProductCardSkeleton } from '../../features/shop/components/ProductCardSkeleton';
import { ProductQuickViewModal } from '../../features/shop/components/ProductQuickViewModal';

const PAGE_SIZE = 12;

export const ShopPage: React.FC = () => {
  const {
    products,
    total,
    totalPages,
    facets,
    isLoading,
    isFacetsLoading,
    filters,
    viewMode,
    setViewMode,
    hasActiveFilters,
    toggleCategory,
    toggleBrand,
    setPriceRange,
    setInStockOnly,
    setMinRating,
    setSortBy,
    setPage,
    resetFilters,
    removeFilter,
  } = useShopProducts(PAGE_SIZE);

  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [quickViewProduct, setQuickViewProduct] = useState<ProductItem | null>(null);

  const activeFilterCount =
    (filters.search ? 1 : 0) +
    filters.categoryIds.length +
    filters.brandIds.length +
    (filters.minPrice !== undefined || filters.maxPrice !== undefined ? 1 : 0) +
    (filters.inStockOnly ? 1 : 0) +
    (filters.minRating !== undefined ? 1 : 0);

  return (
    <div className="w-full bg-[#fcfcfd] min-h-[calc(100vh-140px)] pb-16">
      {/* 1. Header & Breadcrumb Bar */}
      <div className="bg-white border-b border-slate-200 py-3.5 px-4 mb-6">
        <div className="max-w-[1320px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-slate-500">
            <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-amber-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
            <span className="font-semibold text-slate-800">Shop Catalog</span>
            {filters.search && (
              <>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                <span className="text-amber-600 truncate max-w-[180px]">"{filters.search}"</span>
              </>
            )}
          </nav>

          {/* Catalog stats */}
          <div className="text-xs text-slate-400">
            {facets?.total ? `${facets.total} total curated products` : 'Explore our collection'}
          </div>
        </div>
      </div>

      {/* 2. Main Shop Container */}
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-start gap-6">
          {/* Desktop Filter Sidebar (Left, 270px) */}
          <aside className="hidden lg:block w-[270px] shrink-0 sticky top-20">
            <ShopFilterSidebar
              filters={filters}
              facets={facets}
              isLoading={isFacetsLoading}
              onToggleCategory={toggleCategory}
              onToggleBrand={toggleBrand}
              onSetPriceRange={setPriceRange}
              onSetInStockOnly={setInStockOnly}
              onSetMinRating={setMinRating}
              onResetFilters={resetFilters}
            />
          </aside>

          {/* Main Discovery Feed (Right) */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">
            {/* Toolbar: Counter, Sort dropdown, Grid/List viewmode, Mobile filter trigger */}
            <ShopToolbar
              total={total}
              page={filters.page}
              pageSize={PAGE_SIZE}
              filters={filters}
              viewMode={viewMode}
              activeFilterCount={activeFilterCount}
              onViewModeChange={setViewMode}
              onSortChange={setSortBy}
              onOpenMobileFilters={() => setMobileFilterOpen(true)}
            />

            {/* Active Filter Chips */}
            <ActiveFilterChips
              filters={filters}
              facets={facets}
              onRemoveFilter={removeFilter}
              onResetFilters={resetFilters}
            />

            {/* Products Grid / List / Skeletons */}
            {isLoading ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {Array.from({ length: 6 }).map((_, idx) => (
                  <ProductCardSkeleton key={idx} viewMode={viewMode} />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div
                className={
                  viewMode === 'grid'
                    ? 'grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4'
                    : 'flex flex-col gap-3'
                }
              >
                {products.map((product) => (
                  <ProductCard
                    key={product._id}
                    product={product}
                    viewMode={viewMode}
                    onQuickView={(p) => setQuickViewProduct(p)}
                  />
                ))}
              </div>
            ) : (
              /* Empty State */
              <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-slate-200 rounded-md my-4">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4 text-slate-400">
                  <PackageSearch className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-slate-800 mb-1">
                  No matching products found
                </h3>
                <p className="text-xs text-slate-500 max-w-sm mb-5 leading-relaxed">
                  We couldn't find any products matching your selected search criteria and filters. Try widening your price range or clearing specific filters.
                </p>
                {hasActiveFilters && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={resetFilters}
                    leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
                  >
                    Clear All Filters
                  </Button>
                )}
              </div>
            )}

            {/* Pagination */}
            {!isLoading && total > PAGE_SIZE && (
              <div className="pt-4 flex justify-center sm:justify-end">
                <Pagination
                  page={filters.page}
                  pageSize={PAGE_SIZE}
                  total={total}
                  itemLabel="products"
                  onPageChange={(p) => {
                    setPage(p);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 3. Mobile Filter Drawer */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity duration-200"
            onClick={() => setMobileFilterOpen(false)}
          />

          {/* Drawer container */}
          <div className="fixed inset-y-0 right-0 max-w-xs w-full bg-white z-10 flex flex-col p-4 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-4">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-amber-500" />
                <span className="font-bold text-sm text-slate-800">Filters</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileFilterOpen(false)}
                className="p-1.5 rounded-md hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <ShopFilterSidebar
              filters={filters}
              facets={facets}
              isLoading={isFacetsLoading}
              onToggleCategory={toggleCategory}
              onToggleBrand={toggleBrand}
              onSetPriceRange={setPriceRange}
              onSetInStockOnly={setInStockOnly}
              onSetMinRating={setMinRating}
              onResetFilters={resetFilters}
            />

            <div className="mt-6 pt-4 border-t border-slate-100">
              <Button
                variant="primary"
                fullWidth
                onClick={() => setMobileFilterOpen(false)}
              >
                View {total} Results
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* 4. Quick View Modal */}
      <ProductQuickViewModal
        product={quickViewProduct}
        isOpen={Boolean(quickViewProduct)}
        onClose={() => setQuickViewProduct(null)}
      />
    </div>
  );
};

export default ShopPage;
