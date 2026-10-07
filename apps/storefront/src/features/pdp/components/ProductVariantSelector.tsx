import React from 'react';
import type { ProductVariant } from '@shared/types/product';
import { Check } from 'lucide-react';

interface ProductVariantSelectorProps {
  variants: ProductVariant[];
  selectedVariant: ProductVariant | null;
  onSelectVariant: (variant: ProductVariant) => void;
}

export const ProductVariantSelector: React.FC<ProductVariantSelectorProps> = ({
  variants,
  selectedVariant,
  onSelectVariant,
}) => {
  if (!variants || variants.length === 0) return null;

  return (
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 uppercase tracking-wider">
          Available Configurations / Editions
        </label>
        {selectedVariant && (
          <span className="text-xs font-semibold text-amber-700">
            Selected: {selectedVariant.title}
          </span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {variants.map((v) => {
          const isSelected = selectedVariant?.sku === v.sku;
          const isOos = v.stockQuantity <= 0;
          const price = v.salePrice && v.salePrice > 0 ? v.salePrice : v.price;

          return (
            <button
              key={v.sku}
              type="button"
              disabled={isOos}
              onClick={() => onSelectVariant(v)}
              className={`relative flex items-center justify-between p-3 rounded-md border text-left transition-all cursor-pointer ${
                isSelected
                  ? 'border-amber-500 bg-amber-50/60 ring-2 ring-amber-500/20'
                  : isOos
                  ? 'border-slate-200 bg-slate-50 opacity-50 cursor-not-allowed'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center gap-2.5 truncate pr-2">
                {v.imageUrl && (
                  <div className="w-10 h-10 rounded-md border border-slate-100 bg-white p-0.5 shrink-0 overflow-hidden flex items-center justify-center">
                    <img
                      src={v.imageUrl}
                      alt={v.title}
                      className="w-full h-full object-contain"
                    />
                  </div>
                )}
                <div className="truncate">
                  <div className="text-xs font-bold text-slate-900 truncate">
                    {v.title}
                  </div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    SKU: {v.sku}
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <div className="text-xs font-bold text-slate-900">
                  ${price.toFixed(2)}
                </div>
                {isOos ? (
                  <div className="text-[10px] text-rose-500 font-semibold">Sold Out</div>
                ) : (
                  <div className="text-[10px] text-emerald-600 font-medium">
                    {v.stockQuantity} in stock
                  </div>
                )}
              </div>

              {isSelected && (
                <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-amber-500 text-white flex items-center justify-center">
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default ProductVariantSelector;
