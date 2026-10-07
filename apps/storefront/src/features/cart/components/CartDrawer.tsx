import React, { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../../settings/context/SettingsContext';
import { ROUTES } from '../../../routes/routePaths';

export const CartDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    itemCount,
    subtotal,
    qualifiesForFreeShipping,
    amountToFreeShipping,
    updateQuantity,
    removeItem,
  } = useCart();
  const { formatPrice, settings } = useSettings();

  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeDrawer();
    };
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isDrawerOpen, closeDrawer]);

  if (!isDrawerOpen) return null;

  const freeShippingThreshold = settings.freeShippingThreshold || 50;
  const freeShippingPercent = Math.min(100, Math.round((subtotal / freeShippingThreshold) * 100));

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={closeDrawer}
        aria-hidden="true"
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div
          ref={drawerRef}
          className="w-screen max-w-md bg-white border-l border-slate-200 flex flex-col shadow-none animate-in slide-in-from-right duration-200 select-none"
        >
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-md bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Shopping Cart ({itemCount})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              aria-label="Close cart drawer"
              className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amazon-Style Free Shipping Progress Bar */}
          <div className="px-5 py-3 bg-amber-50/50 border-b border-amber-100">
            {qualifiesForFreeShipping ? (
              <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Congratulations! Your order qualifies for <strong>FREE Shipping</strong>.</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-700 font-medium">
                  <span className="flex items-center gap-1.5">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    <span>Add <strong>{formatPrice(amountToFreeShipping)}</strong> more for FREE Shipping</span>
                  </span>
                  <span className="text-[11px] font-bold text-amber-700">{freeShippingPercent}%</span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-amber-500 h-full rounded-full transition-all duration-300"
                    style={{ width: `${freeShippingPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="text-base font-bold text-slate-800">Your cart is empty</h3>
                <p className="text-xs text-slate-400 max-w-xs leading-relaxed">
                  Explore our curated premier catalog and add products to your cart.
                </p>
                <Link
                  to={ROUTES.CUSTOMER.SHOP}
                  onClick={closeDrawer}
                  className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] text-white text-xs font-bold transition-colors cursor-pointer shadow-none"
                >
                  <span>Start Shopping</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3.5 p-3 rounded-md border border-slate-200 hover:border-slate-300 bg-white transition-colors"
                >
                  {/* Thumbnail */}
                  <Link
                    to={`/products/${item.productSlug}`}
                    onClick={closeDrawer}
                    className="w-16 h-16 sm:w-20 sm:h-20 shrink-0 bg-slate-50 border border-slate-100 rounded-md p-1.5 flex items-center justify-center overflow-hidden cursor-pointer"
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain"
                      loading="lazy"
                    />
                  </Link>

                  {/* Info */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <Link
                        to={`/products/${item.productSlug}`}
                        onClick={closeDrawer}
                        className="text-xs sm:text-sm font-bold text-slate-900 hover:text-amber-600 line-clamp-2 leading-snug transition-colors"
                      >
                        {item.name}
                      </Link>
                      {item.variantTitle && (
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                          Variant: <span className="font-semibold text-slate-700">{item.variantTitle}</span>
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs sm:text-sm font-bold text-slate-900">
                          {formatPrice(item.price)}
                        </span>
                        {item.originalPrice > item.price && (
                          <span className="text-[11px] text-slate-400 line-through">
                            {formatPrice(item.originalPrice)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stepper & Delete */}
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                      {/* Stepper */}
                      <div className="flex items-center border border-slate-200 rounded-md h-7 overflow-hidden bg-white">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-xs font-bold text-slate-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={item.trackInventory && item.quantity >= item.stockQuantity}
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-6 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 active:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Remove item"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Sticky Bottom Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50/70 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):</span>
                <span className="text-base font-extrabold text-slate-900">{formatPrice(subtotal)}</span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <Link
                  to={ROUTES.CUSTOMER.CART}
                  onClick={closeDrawer}
                  className="py-2.5 px-4 rounded-md border border-slate-300 bg-white hover:bg-slate-50 active:bg-slate-100 text-slate-800 font-bold text-xs text-center transition-colors cursor-pointer shadow-none"
                >
                  View Cart
                </Link>

                <button
                  type="button"
                  onClick={() => {
                    closeDrawer();
                    navigate(ROUTES.CUSTOMER.CHECKOUT);
                  }}
                  className="py-2.5 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white font-bold text-xs text-center transition-colors cursor-pointer shadow-none"
                >
                  Checkout
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Safe & Secure 256-bit SSL Checkout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
