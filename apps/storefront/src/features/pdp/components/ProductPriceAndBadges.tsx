import React from 'react';
import { Tag, Sparkles } from 'lucide-react';

interface ProductPriceAndBadgesProps {
  basePrice: number;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  savingsAmount: number;
  currency?: string;
}

export const ProductPriceAndBadges: React.FC<ProductPriceAndBadgesProps> = ({
  basePrice,
  effectivePrice,
  hasDiscount,
  discountPercent,
  savingsAmount,
  currency = 'USD',
}) => {
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-baseline flex-wrap gap-2.5">
        {/* Effective Live Price */}
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          ${effectivePrice.toFixed(2)}
        </span>

        {/* Original Strike-through price */}
        {hasDiscount && (
          <span className="text-lg text-slate-400 line-through font-medium">
            ${basePrice.toFixed(2)}
          </span>
        )}

        {/* Discount savings pill */}
        {hasDiscount && (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <Tag className="w-3 h-3" />
            <span>Save ${savingsAmount.toFixed(2)} ({discountPercent}% OFF)</span>
          </span>
        )}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span>Standard retail pricing in {currency}.</span>
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Best Price Guaranteed</span>
        </span>
      </div>
    </div>
  );
};

export default ProductPriceAndBadges;
