import React from 'react';
import {
  LayoutGrid,
  List,
  SlidersHorizontal,
  ArrowUpDown,
} from 'lucide-react';
import type { ViewMode, ShopFilters } from '../hooks/useShopProducts';

interface ShopToolbarProps {
  total: number;
  page: number;
  pageSize: number;
  filters: ShopFilters;
  viewMode: ViewMode;
  activeFilterCount: number;
  onViewModeChange: (mode: ViewMode) => void;
  onSortChange: (sort: string) => void;
  onOpenMobileFilters: () => void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest Arrivals' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Customer Rating' },
  { value: 'name_asc', label: 'Product Name (A-Z)' },
];

export const ShopToolbar: React.FC<ShopToolbarProps> = ({
  total,
  page,
  pageSize,
  filters,
  viewMode,
  activeFilterCount,
  onViewModeChange,
  onSortChange,
  onOpenMobileFilters,
}) => {
  const startItem = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const endItem = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 bg-white border border-slate-200 rounded-md">
      {/* Left: Results Count & Mobile Filter trigger */}
      <div className="flex items-center justify-between sm:justify-start gap-3">
        {/* Mobile Filter Button */}
        <button
          type="button"
          onClick={onOpenMobileFilters}
          className="lg:hidden inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-colors cursor-pointer"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Filters</span>
          {activeFilterCount > 0 && (
            <span className="ml-1 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[10px] font-bold">
              {activeFilterCount}
            </span>
          )}
        </button>

        {/* Count string */}
        <div className="text-xs text-slate-500">
          {total === 0 ? (
            <span>No products found</span>
          ) : (
            <span>
              Showing <span className="font-semibold text-slate-800">{startItem}–{endItem}</span> of{' '}
              <span className="font-semibold text-slate-800">{total}</span> products
            </span>
          )}
        </div>
      </div>

      {/* Right: Sort and View mode switchers */}
      <div className="flex items-center justify-end gap-3">
        {/* Sort selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="shop-sort" className="text-xs text-slate-500 whitespace-nowrap hidden md:inline">
            Sort by:
          </label>
          <div className="relative">
            <select
              id="shop-sort"
              value={filters.sortBy}
              onChange={(e) => onSortChange(e.target.value)}
              className="appearance-none bg-white border border-slate-200 rounded-md pl-3 pr-8 py-1.5 text-xs font-medium text-slate-700 hover:border-slate-300 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <ArrowUpDown className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        {/* View Mode Toggle (Grid vs List) */}
        <div className="flex items-center border border-slate-200 rounded-md p-0.5 bg-slate-50">
          <button
            type="button"
            onClick={() => onViewModeChange('grid')}
            title="Grid view"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'grid'
                ? 'bg-white text-amber-600 border border-slate-200/60'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onViewModeChange('list')}
            title="List view"
            className={`p-1.5 rounded-md transition-colors cursor-pointer ${
              viewMode === 'list'
                ? 'bg-white text-amber-600 border border-slate-200/60'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <List className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ShopToolbar;
