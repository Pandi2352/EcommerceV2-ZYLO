import React from 'react';
import {
  ShoppingBag,
  Zap,
  Heart,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  RotateCcw,
  ShieldCheck,
} from 'lucide-react';
import Button from '@shared/ui/Button';

interface ProductPurchaseCardProps {
  isOutOfStock: boolean;
  isLowStock: boolean;
  effectiveStock: number;
  trackInventory: boolean;
  quantity: number;
  onQuantityChange: (qty: number) => void;
  onAddToCart: () => void;
  onBuyNow: () => void;
  isWishlisted: boolean;
  onToggleWishlist: () => void;
}

export const ProductPurchaseCard: React.FC<ProductPurchaseCardProps> = ({
  isOutOfStock,
  isLowStock,
  effectiveStock,
  trackInventory,
  quantity,
  onQuantityChange,
  onAddToCart,
  onBuyNow,
  isWishlisted,
  onToggleWishlist,
}) => {
  return (
    <div className="space-y-4 pt-2">
      {/* 1. Live Stock Status Alert */}
      <div className="flex items-center gap-2">
        {isOutOfStock ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
            <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
            <span>Currently Out of Stock. Join waitlist to get notified.</span>
          </div>
        ) : isLowStock ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-amber-50 border border-amber-200 text-amber-900 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
            <span>Hurry! Only {effectiveStock} units left in stock — order soon.</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              In Stock {trackInventory ? `(${effectiveStock} units available for dispatch)` : 'and ready to ship'}
            </span>
          </div>
        )}
      </div>

      {/* 2. Quantity & Action Buttons */}
      <div className="flex flex-wrap items-center gap-2.5 w-full min-w-0">
        {/* Quantity Stepper */}
        <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white shrink-0 h-10 w-28">
          <button
            type="button"
            disabled={quantity <= 1 || isOutOfStock}
            onClick={() => onQuantityChange(quantity - 1)}
            aria-label="Decrease quantity"
            className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-base font-semibold"
          >
            -
          </button>
          <input
            type="number"
            min="1"
            max={trackInventory ? effectiveStock : 99}
            value={quantity}
            disabled={isOutOfStock}
            onChange={(e) => onQuantityChange(parseInt(e.target.value, 10) || 1)}
            className="w-12 text-center text-xs font-bold text-slate-800 border-none focus:outline-none"
          />
          <button
            type="button"
            disabled={isOutOfStock || (trackInventory && quantity >= effectiveStock)}
            onClick={() => onQuantityChange(quantity + 1)}
            aria-label="Increase quantity"
            className="w-8 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer text-base font-semibold"
          >
            +
          </button>
        </div>

        {/* Add to Cart Button */}
        <Button
          variant="primary"
          size="md"
          disabled={isOutOfStock}
          onClick={onAddToCart}
          leftIcon={<ShoppingBag className="w-4 h-4" />}
          className="flex-1 min-w-[130px] h-10 text-xs sm:text-sm font-bold bg-[#2A3B5C] hover:bg-[#1E2B43] justify-center"
        >
          {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
        </Button>

        {/* Buy Now Button */}
        <button
          type="button"
          disabled={isOutOfStock}
          onClick={onBuyNow}
          className="flex-1 min-w-[110px] h-10 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs sm:text-sm tracking-wide disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
        >
          <Zap className="w-4 h-4 fill-white shrink-0" />
          <span>Buy Now</span>
        </button>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={onToggleWishlist}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          aria-label="Wishlist toggle"
          className={`h-10 w-10 shrink-0 rounded-md border flex items-center justify-center transition-colors cursor-pointer ${isWishlisted
              ? 'border-rose-300 bg-rose-50 text-rose-600'
              : 'border-slate-200 bg-white hover:border-slate-300 text-slate-500 hover:text-slate-800'
            }`}
        >
          <Heart
            className={`w-4 h-4 ${isWishlisted ? 'fill-rose-500 stroke-rose-500' : ''}`}
          />
        </button>
      </div>

      {/* 3. Reassurance & Guarantees Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-100">
          <Truck className="w-4 h-4 text-amber-600 shrink-0" />
          <div>
            <div className="font-semibold text-slate-800 text-[11px]">Free Shipping</div>
            <div className="text-[10px] text-slate-400">On orders over $50</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-100">
          <RotateCcw className="w-4 h-4 text-emerald-600 shrink-0" />
          <div>
            <div className="font-semibold text-slate-800 text-[11px]">30-Day Returns</div>
            <div className="text-[10px] text-slate-400">Hassle-free guarantee</div>
          </div>
        </div>

        <div className="flex items-center gap-2 p-2.5 rounded-md bg-slate-50 border border-slate-100">
          <ShieldCheck className="w-4 h-4 text-indigo-600 shrink-0" />
          <div>
            <div className="font-semibold text-slate-800 text-[11px]">Brand Warranty</div>
            <div className="text-[10px] text-slate-400">100% Authentic product</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPurchaseCard;
