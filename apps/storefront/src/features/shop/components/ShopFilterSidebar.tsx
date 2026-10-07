import React, { useState } from 'react';
import {
  Search,
  Check,
  Star,
  RotateCcw,
} from 'lucide-react';
import type { ShopFilters } from '../hooks/useShopProducts';
import type { ProductFacets } from '@shared/types/product';

interface ShopFilterSidebarProps {
  filters: ShopFilters;
  facets: ProductFacets | null;
  isLoading?: boolean;
  onToggleCategory: (categoryId: string) => void;
  onToggleBrand: (brandId: string) => void;
  onSetPriceRange: (min?: number, max?: number) => void;
  onSetInStockOnly: (val: boolean) => void;
  onSetMinRating: (rating?: number) => void;
  onResetFilters: () => void;
}

const PRICE_PRESETS = [
  { label: 'Under $50', min: 0, max: 50 },
  { label: '$50 to $100', min: 50, max: 100 },
  { label: '$100 to $300', min: 100, max: 300 },
  { label: '$300 to $1000', min: 300, max: 1000 },
  { label: 'Over $1000', min: 1000, max: undefined },
];

export const ShopFilterSidebar: React.FC<ShopFilterSidebarProps> = ({
  filters,
  facets,
  isLoading: _isLoading,
  onToggleCategory,
  onToggleBrand,
  onSetPriceRange,
  onSetInStockOnly,
  onSetMinRating,
  onResetFilters,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [minPriceInput, setMinPriceInput] = useState<string>(
    filters.minPrice !== undefined ? String(filters.minPrice) : ''
  );
  const [maxPriceInput, setMaxPriceInput] = useState<string>(
    filters.maxPrice !== undefined ? String(filters.maxPrice) : ''
  );

  // Sync inputs with filters when external filters change
  React.useEffect(() => {
    setMinPriceInput(filters.minPrice !== undefined ? String(filters.minPrice) : '');
    setMaxPriceInput(filters.maxPrice !== undefined ? String(filters.maxPrice) : '');
  }, [filters.minPrice, filters.maxPrice]);

  const handleApplyPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const min = minPriceInput ? parseFloat(minPriceInput) : undefined;
    const max = maxPriceInput ? parseFloat(maxPriceInput) : undefined;
    onSetPriceRange(min, max);
  };

  const filteredBrands = React.useMemo(() => {
    if (!facets?.brands) return [];
    if (!brandSearch.trim()) return facets.brands;
    const term = brandSearch.toLowerCase();
    return facets.brands.filter((b) => b.name.toLowerCase().includes(term));
  }, [facets?.brands, brandSearch]);

  return (
    <div className="w-full bg-white rounded-md border border-slate-200 p-4 divide-y divide-slate-100 space-y-5">
      {/* 1. Header with Reset */}
      <div className="flex items-center justify-between pb-1">
        <h3 className="text-sm font-bold text-slate-900 tracking-wide uppercase">
          Filter Catalog
        </h3>
        <button
          type="button"
          onClick={onResetFilters}
          className="text-xs text-amber-600 hover:text-amber-700 font-semibold inline-flex items-center gap-1 cursor-pointer"
        >
          <RotateCcw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* 2. Categories Filter */}
      <div className="pt-4 space-y-3">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Categories
        </span>

        {facets?.categories && facets.categories.length > 0 ? (
          <div className="space-y-1 max-h-56 overflow-y-auto pr-1">
            {facets.categories.map((cat) => {
              const isSelected = filters.categoryIds.includes(cat.id);
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onToggleCategory(cat.id)}
                  className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer text-left ${
                    isSelected
                      ? 'bg-amber-50 text-amber-900 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate pr-2">{cat.name}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full shrink-0 ${
                      isSelected
                        ? 'bg-amber-200/70 text-amber-900'
                        : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Loading categories...</p>
        )}
      </div>

      {/* 3. Brands Filter (with search) */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Brands
          </span>
          {filters.brandIds.length > 0 && (
            <span className="text-[11px] font-semibold text-amber-600">
              {filters.brandIds.length} selected
            </span>
          )}
        </div>

        {/* Search brand input */}
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search brands..."
            value={brandSearch}
            onChange={(e) => setBrandSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-md focus:bg-white focus:outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        {/* Brand Checkboxes */}
        <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
          {filteredBrands.length > 0 ? (
            filteredBrands.map((brand) => {
              const isChecked = filters.brandIds.includes(brand.id);
              return (
                <label
                  key={brand.id}
                  className="flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-slate-50 cursor-pointer text-xs text-slate-700 transition-colors select-none"
                >
                  <div className="flex items-center gap-2 truncate pr-2">
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => onToggleBrand(brand.id)}
                      className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span className={`truncate ${isChecked ? 'font-semibold text-slate-900' : ''}`}>
                      {brand.name}
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 shrink-0">
                    ({brand.count})
                  </span>
                </label>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 py-1">No matching brands</p>
          )}
        </div>
      </div>

      {/* 4. Price Filter */}
      <div className="pt-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Price Range
          </span>
          {facets?.priceRange && (
            <span className="text-[11px] text-slate-400">
              ${facets.priceRange.min} – ${facets.priceRange.max}
            </span>
          )}
        </div>

        {/* Preset chips */}
        <div className="flex flex-wrap gap-1.5">
          {PRICE_PRESETS.map((preset, i) => {
            const isActive =
              filters.minPrice === preset.min &&
              filters.maxPrice === preset.max;
            return (
              <button
                key={i}
                type="button"
                onClick={() => onSetPriceRange(preset.min, preset.max)}
                className={`px-2 py-1 rounded-md text-[11px] font-medium border transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-amber-50 border-amber-300 text-amber-900 font-semibold'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Min / Max Inputs */}
        <form onSubmit={handleApplyPrice} className="space-y-2 pt-1">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number"
                min="0"
                placeholder="Min"
                value={minPriceInput}
                onChange={(e) => setMinPriceInput(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
              />
            </div>
            <span className="text-slate-300">–</span>
            <div className="relative flex-1">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-slate-400">$</span>
              <input
                type="number"
                min="0"
                placeholder="Max"
                value={maxPriceInput}
                onChange={(e) => setMaxPriceInput(e.target.value)}
                className="w-full pl-6 pr-2 py-1.5 text-xs border border-slate-200 rounded-md focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-1.5 bg-[#2A3B5C] hover:bg-[#1E2B43] text-white text-xs font-semibold rounded-md transition-colors cursor-pointer"
          >
            Apply Price
          </button>
        </form>
      </div>

      {/* 5. Availability (In-Stock Only) */}
      <div className="pt-4 space-y-2">
        <label className="flex items-center justify-between p-2 rounded-md bg-slate-50 border border-slate-100 hover:bg-slate-100/70 transition-colors cursor-pointer select-none">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={filters.inStockOnly}
              onChange={(e) => onSetInStockOnly(e.target.checked)}
              className="rounded border-slate-300 text-amber-500 focus:ring-amber-500 w-3.5 h-3.5 cursor-pointer"
            />
            <span className="text-xs font-semibold text-slate-700">In Stock Only</span>
          </div>
          {facets?.inStockCount !== undefined && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              {facets.inStockCount}
            </span>
          )}
        </label>
      </div>

      {/* 6. Rating Filter */}
      <div className="pt-4 space-y-2">
        <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
          Customer Rating
        </span>
        <div className="space-y-1">
          {[4, 3, 2].map((stars) => {
            const isSelected = filters.minRating === stars;
            return (
              <button
                key={stars}
                type="button"
                onClick={() => onSetMinRating(isSelected ? undefined : stars)}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-amber-50 text-amber-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <div className="flex items-center text-amber-400">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${
                          i < stars
                            ? 'fill-amber-400 stroke-amber-400'
                            : 'stroke-slate-300 text-slate-300'
                        }`}
                      />
                    ))}
                  </div>
                  <span className="ml-1 text-[11px]">& up</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-600" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ShopFilterSidebar;
