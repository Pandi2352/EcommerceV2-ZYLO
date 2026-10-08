import React from 'react';
import { Boxes, Check, ArrowRight, Sparkles } from 'lucide-react';
import type { VolumePricingTier } from '@shared/types/product';
import { useSettings } from '../../settings/context/SettingsContext';

interface ProductVolumePricingTableProps {
  basePrice: number;
  volumeTiers?: VolumePricingTier[] | null;
  selectedQuantity: number;
  onSelectQuantity: (qty: number) => void;
}

export const ProductVolumePricingTable: React.FC<ProductVolumePricingTableProps> = ({
  basePrice,
  volumeTiers,
  selectedQuantity,
  onSelectQuantity,
}) => {
  const { formatPrice } = useSettings();

  if (!volumeTiers || volumeTiers.length === 0) return null;

  // Build sorted tiers list including tier 1 (single unit default)
  const sortedTiers = [...volumeTiers].sort((a, b) => a.minQuantity - b.minQuantity);

  // Determine tiers with 1-unit baseline if not specified
  const displayTiers: Array<{
    label: string;
    minQty: number;
    maxQty?: number | null;
    unitPrice: number;
    discountPercent: number;
  }> = [];

  const firstMin = sortedTiers[0].minQuantity;
  if (firstMin > 1) {
    displayTiers.push({
      label: firstMin === 2 ? '1 unit' : `1 - ${firstMin - 1} units`,
      minQty: 1,
      maxQty: firstMin - 1,
      unitPrice: basePrice,
      discountPercent: 0,
    });
  }

  sortedTiers.forEach((t) => {
    let price = basePrice;
    let disc = t.discountPercent || 0;
    if (t.unitPrice != null && t.unitPrice > 0) {
      price = t.unitPrice;
      disc = Math.max(0, Math.round(((basePrice - price) / basePrice) * 100));
    } else if (disc > 0) {
      price = +(basePrice * (1 - disc / 100)).toFixed(2);
    }

    const label = t.maxQuantity
      ? `${t.minQuantity} - ${t.maxQuantity} units`
      : `${t.minQuantity}+ units`;

    displayTiers.push({
      label,
      minQty: t.minQuantity,
      maxQty: t.maxQuantity,
      unitPrice: price,
      discountPercent: disc,
    });
  });

  // Identify currently active tier
  const activeTierIndex = displayTiers.findIndex((dt) => {
    return (
      selectedQuantity >= dt.minQty &&
      (dt.maxQty == null || selectedQuantity <= dt.maxQty)
    );
  });

  const activeTier = displayTiers[activeTierIndex];
  const totalVolumeSavings =
    activeTier && activeTier.discountPercent > 0
      ? +((basePrice - activeTier.unitPrice) * selectedQuantity).toFixed(2)
      : 0;

  return (
    <div className="rounded-lg border border-amber-200/80 bg-gradient-to-b from-amber-50/40 via-amber-50/10 to-white p-3.5 select-none space-y-2.5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-amber-500/10 text-amber-700 flex items-center justify-center">
            <Boxes className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-bold text-slate-900 tracking-tight">
            Volume Pricing & Wholesale Discounts
          </span>
        </div>
        <span className="text-[10px] font-extrabold text-amber-800 bg-amber-100/80 px-2 py-0.5 rounded-full">
          Buy More, Save More
        </span>
      </div>

      {/* Tiers Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        {displayTiers.map((tier, idx) => {
          const isActive = idx === activeTierIndex;

          return (
            <button
              key={tier.label}
              type="button"
              onClick={() => onSelectQuantity(tier.minQty)}
              className={`p-2.5 rounded-lg border text-left transition-all cursor-pointer relative flex flex-col justify-between ${
                isActive
                  ? 'border-amber-500 bg-white ring-1 ring-amber-500 shadow-xs'
                  : 'border-slate-200/80 bg-white/80 hover:border-amber-300 hover:bg-white'
              }`}
            >
              {isActive && (
                <div className="absolute top-1.5 right-1.5 flex items-center gap-0.5 px-1.5 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-bold">
                  <Check className="w-2.5 h-2.5" />
                  <span>Applied</span>
                </div>
              )}

              <div>
                <span className="text-[11px] font-bold text-slate-800 block truncate">
                  {tier.label}
                </span>
                <span className="text-sm font-extrabold text-slate-900 mt-0.5 block">
                  {formatPrice(tier.unitPrice)}
                  <span className="text-[10px] font-normal text-slate-400 ml-0.5">/ ea</span>
                </span>
              </div>

              <div className="mt-1.5 pt-1 border-t border-slate-100 flex items-center justify-between">
                {tier.discountPercent > 0 ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded">
                    Save {tier.discountPercent}%
                  </span>
                ) : (
                  <span className="text-[10px] font-medium text-slate-400">Regular</span>
                )}
                <span className="text-[10px] font-semibold text-slate-400 group-hover:text-amber-600 flex items-center">
                  Select <ArrowRight className="w-2.5 h-2.5 ml-0.5" />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Live Active Tier Savings Callout */}
      {totalVolumeSavings > 0 ? (
        <div className="flex items-center justify-between text-xs p-2 rounded-md bg-emerald-50 border border-emerald-200/80 text-emerald-800">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
            <span>
              {activeTier?.discountPercent}% Volume Discount Active ({selectedQuantity} units)
            </span>
          </div>
          <span className="font-extrabold">
            Save {formatPrice(totalVolumeSavings)}!
          </span>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 text-center">
          Click any bracket above to automatically set your order quantity and unlock bulk savings.
        </p>
      )}
    </div>
  );
};

export default ProductVolumePricingTable;
