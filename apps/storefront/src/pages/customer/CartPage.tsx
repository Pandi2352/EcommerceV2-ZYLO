import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Trash2,
  Bookmark,
  CheckCircle2,
  Truck,
  ArrowRight,
  ShieldCheck,
  Tag,
  Plus,
  Minus,
  RotateCcw,
  Sparkles,
  ChevronRight,
  Share2,
} from 'lucide-react';
import { useCart } from '../../features/cart/context/CartContext';
import { ROUTES } from '../../routes/routePaths';
import { toast } from '@shared/ui/Toast';

export const CartPage: React.FC = () => {
  const {
    items,
    savedForLater,
    itemCount,
    subtotal,
    savings,
    qualifiesForFreeShipping,
    amountToFreeShipping,
    estimatedShipping,
    estimatedTax,
    discount,
    appliedCoupon,
    grandTotal,
    updateQuantity,
    toggleSelect,
    selectAll,
    removeItem,
    saveForLater,
    moveToCart,
    deleteSavedItem,
    clearCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const navigate = useNavigate();
  const [couponInput, setCouponInput] = useState('');
  const [applyingCoupon, setApplyingCoupon] = useState(false);

  const allSelected = items.length > 0 && items.every((i) => i.selected);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    setApplyingCoupon(true);
    const success = await applyCoupon(couponInput.trim());
    if (success) setCouponInput('');
    setApplyingCoupon(false);
  };

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/product/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Product link copied to clipboard!');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 select-none">
            <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-slate-800 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <Link to={ROUTES.CUSTOMER.SHOP} className="hover:text-slate-800 transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-800 font-bold">Shopping Cart</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left / Main Column: Active Cart & Saved For Later */}
            <div className="lg:col-span-8 space-y-6">
              {/* Main Cart Card */}
              <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
                {/* Header */}
                <div className="border-b border-slate-200 pb-4 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Shopping Cart</h1>
                    {items.length > 0 && (
                      <button
                        type="button"
                        onClick={() => selectAll(!allSelected)}
                        className="text-xs font-semibold text-amber-600 hover:text-amber-700 underline mt-1 cursor-pointer transition-colors"
                      >
                        {allSelected ? 'Deselect all items' : 'Select all items'}
                      </button>
                    )}
                  </div>
                  <span className="hidden sm:inline text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Price
                  </span>
                </div>

                {/* Items List */}
                {items.length === 0 ? (
                  <div className="py-12 text-center flex flex-col items-center">
                    <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
                      <ShoppingBag className="w-8 h-8" />
                    </div>
                    <h2 className="text-lg font-bold text-slate-900 mb-1">Your ZYLO Cart is empty</h2>
                    <p className="text-xs text-slate-500 max-w-sm mb-6 leading-relaxed">
                      Your shopping cart lives to serve. Give it purpose — fill it with groceries, tech gadgets, apparel, and premier lifestyle products.
                    </p>
                    <Link
                      to={ROUTES.CUSTOMER.SHOP}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-white text-xs font-bold transition-colors cursor-pointer shadow-none"
                    >
                      <span>Continue Shopping</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {items.map((item) => (
                      <div key={item.id} className="py-6 flex gap-4 sm:gap-6 items-start">
                        {/* Checkbox (Amazon style selection) */}
                        <div className="pt-2">
                          <input
                            type="checkbox"
                            checked={item.selected}
                            onChange={(e) => toggleSelect(item.id, e.target.checked)}
                            aria-label={`Select ${item.name}`}
                            className="w-4 h-4 rounded text-amber-600 border-slate-300 focus:ring-amber-500 cursor-pointer"
                          />
                        </div>

                        {/* Thumbnail */}
                        <Link
                          to={`/products/${item.productSlug}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 shrink-0 bg-slate-50 border border-slate-200 rounded-md p-2 flex items-center justify-center overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                            loading="lazy"
                          />
                        </Link>

                        {/* Item Details */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                            <div>
                              <Link
                                to={`/products/${item.productSlug}`}
                                className="text-sm sm:text-base font-bold text-slate-900 hover:text-amber-600 leading-snug transition-colors line-clamp-2"
                              >
                                {item.name}
                              </Link>

                              {item.brandName && (
                                <p className="text-xs text-slate-500 mt-0.5">
                                  by <strong className="text-slate-700">{item.brandName}</strong>
                                </p>
                              )}

                              {item.variantTitle && (
                                <p className="text-xs text-slate-600 mt-1 font-medium">
                                  Variant: <span className="text-slate-900 font-semibold">{item.variantTitle}</span>
                                </p>
                              )}

                              {/* Stock status badge */}
                              <div className="mt-2">
                                {item.inStock ? (
                                  <span className="text-xs font-semibold text-emerald-600">
                                    In Stock
                                  </span>
                                ) : (
                                  <span className="text-xs font-semibold text-rose-600">
                                    Currently Out of Stock
                                  </span>
                                )}
                              </div>
                            </div>

                            {/* Price */}
                            <div className="text-left sm:text-right shrink-0">
                              <p className="text-base sm:text-lg font-black text-slate-900">
                                ${(item.price * item.quantity).toFixed(2)}
                              </p>
                              {item.originalPrice > item.price && (
                                <p className="text-xs text-slate-400 line-through">
                                  ${(item.originalPrice * item.quantity).toFixed(2)}
                                </p>
                              )}
                              {item.quantity > 1 && (
                                <p className="text-[11px] text-slate-400">
                                  (${item.price.toFixed(2)} each)
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Amazon-Style Action Row */}
                          <div className="mt-4 pt-3 flex flex-wrap items-center gap-4 text-xs text-slate-600">
                            {/* Stepper */}
                            <div className="flex items-center border border-slate-200 rounded-md h-8 bg-white overflow-hidden">
                              <button
                                type="button"
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="w-7 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
                                aria-label="Decrease quantity"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center text-xs font-bold text-slate-800">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={item.trackInventory && item.quantity >= item.stockQuantity}
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="w-7 h-full flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
                                aria-label="Increase quantity"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <span className="text-slate-300">|</span>

                            <button
                              type="button"
                              onClick={() => removeItem(item.id)}
                              className="text-amber-700 hover:text-amber-800 hover:underline font-semibold cursor-pointer transition-colors"
                            >
                              Delete
                            </button>

                            <span className="text-slate-300">|</span>

                            <button
                              type="button"
                              onClick={() => saveForLater(item.id)}
                              className="text-amber-700 hover:text-amber-800 hover:underline font-semibold cursor-pointer transition-colors"
                            >
                              Save for later
                            </button>

                            <span className="text-slate-300">|</span>

                            <button
                              type="button"
                              onClick={() => handleShare(item.productSlug)}
                              className="inline-flex items-center gap-1 text-slate-500 hover:text-slate-800 cursor-pointer transition-colors"
                            >
                              <Share2 className="w-3 h-3" />
                              <span>Share</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Bottom Subtotal row */}
                {items.length > 0 && (
                  <div className="border-t border-slate-200 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
                    <button
                      type="button"
                      onClick={clearCart}
                      className="text-xs text-rose-600 hover:text-rose-700 underline font-semibold text-left cursor-pointer"
                    >
                      Clear entire cart
                    </button>
                    <div className="text-sm text-slate-700">
                      Subtotal ({itemCount} {itemCount === 1 ? 'item' : 'items'}):{' '}
                      <strong className="text-lg font-black text-slate-900">${subtotal.toFixed(2)}</strong>
                    </div>
                  </div>
                )}
              </div>

              {/* Amazon Signature: Saved For Later Section */}
              {savedForLater.length > 0 && (
                <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
                  <div className="border-b border-slate-200 pb-3 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bookmark className="w-5 h-5 text-amber-600" />
                      <h2 className="text-lg font-bold text-slate-900">
                        Saved for later ({savedForLater.length} {savedForLater.length === 1 ? 'item' : 'items'})
                      </h2>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 mt-2">
                    {savedForLater.map((item) => (
                      <div key={item.id} className="py-4 flex gap-4 items-center justify-between">
                        <div className="flex items-center gap-4 min-w-0">
                          <Link
                            to={`/products/${item.productSlug}`}
                            className="w-16 h-16 shrink-0 bg-slate-50 border border-slate-200 rounded-md p-1.5 flex items-center justify-center overflow-hidden"
                          >
                            <img
                              src={item.image}
                              alt={item.name}
                              className="w-full h-full object-contain"
                              loading="lazy"
                            />
                          </Link>
                          <div className="min-w-0">
                            <Link
                              to={`/products/${item.productSlug}`}
                              className="text-sm font-bold text-slate-900 hover:text-amber-600 line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            {item.variantTitle && (
                              <p className="text-xs text-slate-500">{item.variantTitle}</p>
                            )}
                            <p className="text-sm font-black text-slate-900 mt-1">
                              ${item.price.toFixed(2)}
                            </p>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-3 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveToCart(item.id)}
                            className="px-3.5 py-1.5 rounded-md border border-slate-300 hover:bg-slate-50 text-xs font-bold text-slate-800 transition-colors cursor-pointer shadow-none"
                          >
                            Move to cart
                          </button>
                          <button
                            type="button"
                            onClick={() => deleteSavedItem(item.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Sticky Order Summary Card */}
            <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
              {/* Order Summary Box */}
              <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none space-y-5">
                {/* Free Shipping Qualification Banner */}
                {items.length > 0 && (
                  <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-md">
                    {qualifiesForFreeShipping ? (
                      <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Your order qualifies for <strong>FREE Shipping</strong>.</span>
                      </div>
                    ) : (
                      <div className="space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs text-slate-700 font-medium">
                          <Truck className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                          <span>Add <strong>${amountToFreeShipping.toFixed(2)}</strong> of eligible items to get <strong>FREE Shipping</strong>.</span>
                        </div>
                        <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            className="bg-amber-500 h-full rounded-full transition-all"
                            style={{ width: `${Math.min(100, Math.round((subtotal / 50) * 100))}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Subtotal Banner */}
                <div>
                  <div className="flex items-baseline justify-between">
                    <span className="text-sm font-bold text-slate-700">Subtotal ({itemCount} items):</span>
                    <span className="text-xl font-black text-slate-900">${subtotal.toFixed(2)}</span>
                  </div>
                  {savings > 0 && (
                    <p className="text-xs font-bold text-emerald-600 mt-1">
                      You save: ${savings.toFixed(2)}
                    </p>
                  )}
                </div>

                {/* Proceed to Checkout Action */}
                <button
                  type="button"
                  disabled={items.length === 0 || itemCount === 0}
                  onClick={() => navigate(ROUTES.CUSTOMER.CHECKOUT)}
                  className="w-full py-3.5 px-4 rounded-md bg-amber-500 hover:bg-amber-600 active:bg-amber-700 disabled:opacity-40 disabled:cursor-not-allowed text-white font-bold text-sm text-center transition-colors cursor-pointer shadow-none tracking-wide"
                >
                  Proceed to checkout ({itemCount} {itemCount === 1 ? 'item' : 'items'})
                </button>

                {/* Promotional Coupon Entry */}
                <div className="pt-3 border-t border-slate-100">
                  <form onSubmit={handleApplyCoupon} className="space-y-2">
                    <label className="block text-xs font-bold text-slate-700">
                      Promotional Code or Coupon
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Tag className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
                        <input
                          type="text"
                          value={couponInput}
                          onChange={(e) => setCouponInput(e.target.value)}
                          placeholder="e.g. ZYLO10, FREESHIP"
                          className="w-full pl-8 pr-3 py-1.5 text-xs uppercase border border-slate-200 rounded-md focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={applyingCoupon || !couponInput.trim()}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-md text-xs font-bold disabled:opacity-40 cursor-pointer shadow-none transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                  </form>

                  {appliedCoupon && (
                    <div className="mt-2.5 flex items-center justify-between p-2 bg-emerald-50 border border-emerald-200 rounded-md text-xs">
                      <span className="font-bold text-emerald-800">
                        Coupon "{appliedCoupon}" applied
                      </span>
                      <button
                        type="button"
                        onClick={removeCoupon}
                        className="text-rose-600 hover:underline font-semibold cursor-pointer"
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>

                {/* Price Breakdown */}
                <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600">
                  <div className="flex justify-between">
                    <span>Items Subtotal</span>
                    <span className="font-semibold text-slate-800">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Estimated Shipping</span>
                    <span className="font-semibold text-slate-800">
                      {estimatedShipping === 0 ? (
                        <span className="text-emerald-600 font-bold">FREE</span>
                      ) : (
                        `$${estimatedShipping.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-emerald-600 font-bold">
                      <span>Promotional Discount</span>
                      <span>-${discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span>Estimated Tax (8%)</span>
                    <span className="font-semibold text-slate-800">${estimatedTax.toFixed(2)}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between text-sm font-black text-slate-900">
                    <span>Estimated Order Total</span>
                    <span>${grandTotal.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Amazon-Style Buyer Protection Strip */}
              <div className="bg-white border border-slate-200 rounded-md p-4 space-y-3 shadow-none text-xs text-slate-600">
                <div className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span><strong>Secure Checkout:</strong> Encrypted data transmission.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-4 h-4 text-amber-600 shrink-0" />
                  <span><strong>30-Day Returns:</strong> Free returns on eligible items.</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span><strong>Authenticity Guarantee:</strong> 100% genuine products.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default CartPage;
