import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  ShoppingBag,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Plus,
  Minus,
  Share2,
  Bookmark,
  BookmarkPlus,
  RotateCcw,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useSettings } from '../../settings/context/SettingsContext';
import { ROUTES } from '../../../routes/routePaths';
import FreeShippingProgressBar from './FreeShippingProgressBar';
import CartUpsellCarousel from './CartUpsellCarousel';
import ShareCartModal from './ShareCartModal';
import SavedCartsModal from './SavedCartsModal';

export const CartDrawer: React.FC = () => {
  const {
    isDrawerOpen,
    closeDrawer,
    items,
    savedForLater,
    itemCount,
    subtotal,
    updateQuantity,
    removeItem,
    saveForLater,
    moveToCart,
    deleteSavedItem,
  } = useCart();
  const { formatPrice } = useSettings();

  const navigate = useNavigate();
  const drawerRef = useRef<HTMLDivElement>(null);

  // Active Tab inside Drawer: "cart" | "saved"
  const [activeTab, setActiveTab] = useState<'cart' | 'saved'>('cart');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isSavedCartsModalOpen, setIsSavedCartsModalOpen] = useState(false);

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

  return (
    <>
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
                <div>
                  <h2 className="text-base font-bold text-slate-900 tracking-tight leading-none">
                    Shopping Cart
                  </h2>
                  <span className="text-[11px] text-slate-500 mt-0.5 block">
                    {itemCount} {itemCount === 1 ? 'item' : 'items'} in basket
                  </span>
                </div>
              </div>

              {/* Header Action Tools */}
              <div className="flex items-center gap-1">
                {items.length > 0 && (
                  <>
                    <button
                      type="button"
                      onClick={() => setIsShareModalOpen(true)}
                      title="Share Cart"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Share2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsSavedCartsModalOpen(true)}
                      title="Saved Carts"
                      className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors cursor-pointer"
                    >
                      <Bookmark className="w-4 h-4" />
                    </button>
                  </>
                )}
                <button
                  type="button"
                  onClick={closeDrawer}
                  aria-label="Close cart drawer"
                  className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors cursor-pointer ml-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* View Switcher: Cart vs Saved For Later */}
            <div className="flex border-b border-slate-200 bg-slate-50/60 px-4 pt-1.5 gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('cart')}
                className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'cart'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Cart ({itemCount})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('saved')}
                className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer ${
                  activeTab === 'saved'
                    ? 'border-amber-500 text-amber-700'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                Saved for Later ({savedForLater.length})
              </button>
            </div>

            {/* Dynamic Multi-Tier Free Shipping Progress Bar */}
            {activeTab === 'cart' && <FreeShippingProgressBar subtotal={subtotal} />}

            {/* Drawer Body */}
            <div className="flex-1 overflow-y-auto">
              {activeTab === 'cart' ? (
                /* Active Cart Items */
                items.length === 0 ? (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-3">
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
                  <div className="p-4 sm:p-5 space-y-3.5">
                    {items.map((item) => (
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
                                Variant:{' '}
                                <span className="font-semibold text-slate-700">
                                  {item.variantTitle}
                                </span>
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

                          {/* Stepper, Save For Later & Delete */}
                          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                            {/* Quantity Stepper */}
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

                            {/* Save For Later & Remove Actions */}
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => saveForLater(item.id)}
                                className="p-1 text-slate-400 hover:text-amber-600 transition-colors cursor-pointer"
                                title="Save for later"
                              >
                                <BookmarkPlus className="w-3.5 h-3.5" />
                              </button>
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
                      </div>
                    ))}
                  </div>
                )
              ) : (
                /* Saved For Later Items */
                savedForLater.length === 0 ? (
                  <div className="h-full min-h-[260px] flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-300">
                      <Bookmark className="w-6 h-6" />
                    </div>
                    <h3 className="text-sm font-bold text-slate-800">No saved items</h3>
                    <p className="text-xs text-slate-400 max-w-xs">
                      Move items here from your cart to buy them on your next visit.
                    </p>
                  </div>
                ) : (
                  <div className="p-4 sm:p-5 space-y-3">
                    {savedForLater.map((item) => (
                      <div
                        key={item.id}
                        className="flex gap-3 p-3 rounded-md border border-slate-200 bg-slate-50/50"
                      >
                        <div className="w-14 h-14 bg-white border border-slate-100 rounded-md p-1 shrink-0 flex items-center justify-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-full h-full object-contain"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                            <span className="text-xs font-extrabold text-slate-800">
                              {formatPrice(item.price)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-slate-200/60">
                            <button
                              type="button"
                              onClick={() => moveToCart(item.id)}
                              className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700 cursor-pointer"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Move to Cart</span>
                            </button>
                            <span className="text-slate-300">•</span>
                            <button
                              type="button"
                              onClick={() => deleteSavedItem(item.id)}
                              className="text-[11px] text-slate-400 hover:text-rose-600 cursor-pointer"
                            >
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )
              )}

              {/* 1-Click Cart Upsells & Cross-Sells Carousel inside the Drawer */}
              {activeTab === 'cart' && items.length > 0 && (
                <CartUpsellCarousel />
              )}
            </div>

            {/* Sticky Bottom Summary */}
            {activeTab === 'cart' && items.length > 0 && (
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

      {/* Share Cart Modal */}
      <ShareCartModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        items={items}
        subtotal={subtotal}
      />

      {/* Saved Carts Modal */}
      <SavedCartsModal
        isOpen={isSavedCartsModalOpen}
        onClose={() => setIsSavedCartsModalOpen(false)}
      />
    </>
  );
};

export default CartDrawer;
