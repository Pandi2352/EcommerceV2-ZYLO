import React from 'react';
import { Tag, Sparkles, Boxes } from 'lucide-react';
import { useSettings } from '../../settings/context/SettingsContext';

interface ProductPriceAndBadgesProps {
  basePrice: number;
  effectivePrice: number;
  hasDiscount: boolean;
  discountPercent: number;
  savingsAmount: number;
  currency?: string;
  isVolumeDiscounted?: boolean;
  volumeDiscountPercent?: number;
}

export const ProductPriceAndBadges: React.FC<ProductPriceAndBadgesProps> = ({
  basePrice,
  effectivePrice,
  hasDiscount,
  discountPercent,
  savingsAmount,
  isVolumeDiscounted,
  volumeDiscountPercent,
}) => {
  const { formatPrice, currencyCode } = useSettings();
  return (
    <div className="space-y-1.5 py-1">
      <div className="flex items-baseline flex-wrap gap-2.5">
        {/* Effective Live Price */}
        <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {formatPrice(effectivePrice)}
        </span>

        {/* Original Strike-through price */}
        {hasDiscount && (
          <span className="text-lg text-slate-400 line-through font-medium">
            {formatPrice(basePrice)}
          </span>
        )}

        {/* Volume discount pill */}
        {isVolumeDiscounted ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-800 border border-amber-300 text-xs font-bold animate-in fade-in">
            <Boxes className="w-3.5 h-3.5 text-amber-600" />
            <span>Volume Tier Active (-{volumeDiscountPercent}%)</span>
          </span>
        ) : hasDiscount ? (
          /* Standard discount savings pill */
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
            <Tag className="w-3 h-3" />
            <span>Save {formatPrice(savingsAmount)} ({discountPercent}% OFF)</span>
          </span>
        ) : null}
      </div>

      <div className="flex items-center gap-3 text-[11px] text-slate-400">
        <span>Standard retail pricing in {currencyCode}.</span>
        <span className="inline-flex items-center gap-1 text-amber-700 font-medium">
          <Sparkles className="w-3 h-3 text-amber-500" />
          <span>Best Price Guaranteed</span>
        </span>
      </div>
    </div>
  );
};

export default ProductPriceAndBadges;
