import React from 'react';
import { X, RotateCcw } from 'lucide-react';
import type { ShopFilters } from '../hooks/useShopProducts';
import type { ProductFacets } from '@shared/types/product';

interface ActiveFilterChipsProps {
  filters: ShopFilters;
  facets: ProductFacets | null;
  onRemoveFilter: (key: keyof ShopFilters, value?: string) => void;
  onResetFilters: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  filters,
  facets,
  onRemoveFilter,
  onResetFilters,
}) => {
  const chips: { key: keyof ShopFilters; value?: string; label: string }[] = [];

  // Search
  if (filters.search) {
    chips.push({
      key: 'search',
      label: `Keyword: "${filters.search}"`,
    });
  }

  // Categories
  if (filters.categoryIds.length > 0 && facets?.categories) {
    filters.categoryIds.forEach((catId) => {
      const cat = facets.categories.find((c) => c.id === catId);
      chips.push({
        key: 'categoryIds',
        value: catId,
        label: cat ? cat.name : 'Category',
      });
    });
  }

  // Brands
  if (filters.brandIds.length > 0 && facets?.brands) {
    filters.brandIds.forEach((brandId) => {
      const brand = facets.brands.find((b) => b.id === brandId);
      chips.push({
        key: 'brandIds',
        value: brandId,
        label: brand ? brand.name : 'Brand',
      });
    });
  }

  // Price range
  if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
    let priceLabel = 'Price: ';
    if (filters.minPrice !== undefined && filters.maxPrice !== undefined) {
      priceLabel += `$${filters.minPrice} – $${filters.maxPrice}`;
    } else if (filters.minPrice !== undefined) {
      priceLabel += `≥ $${filters.minPrice}`;
    } else if (filters.maxPrice !== undefined) {
      priceLabel += `≤ $${filters.maxPrice}`;
    }
    chips.push({
      key: 'minPrice',
      label: priceLabel,
    });
  }

  // In Stock
  if (filters.inStockOnly) {
    chips.push({
      key: 'inStockOnly',
      label: 'In Stock Only',
    });
  }

  // Rating
  if (filters.minRating !== undefined) {
    chips.push({
      key: 'minRating',
      label: `${filters.minRating}★ & above`,
    });
  }

  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 py-2">
      <span className="text-xs font-semibold text-slate-500">Active Filters:</span>

      {chips.map((chip, idx) => (
        <span
          key={`${chip.key}-${chip.value || idx}`}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-900 border border-amber-200"
        >
          <span>{chip.label}</span>
          <button
            type="button"
            onClick={() => onRemoveFilter(chip.key, chip.value)}
            className="hover:text-amber-700 hover:bg-amber-100 rounded-xs p-0.5 transition-colors cursor-pointer"
            aria-label={`Remove filter ${chip.label}`}
          >
            <X className="w-3 h-3" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onResetFilters}
        className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
};

export default ActiveFilterChips;
