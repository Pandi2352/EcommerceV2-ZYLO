import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  ShoppingBag,
  Trash2,
  ChevronRight,
  ArrowRight,
  Star,
  Share2,
  AlertCircle,
  CheckCircle2,
  LogIn,
  PackageOpen,
} from 'lucide-react';
import { useWishlist } from '../../features/wishlist/context/WishlistContext';
import { useAuth } from '@shared/auth/AuthContext';
import { ROUTES } from '../../routes/routePaths';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';

export const WishlistPage: React.FC = () => {
  const { user } = useAuth();
  const {
    items,
    totalCount,
    isLoading,
    removeFromWishlist,
    clearWishlist,
    moveToCart,
    moveAllToCart,
  } = useWishlist();

  const [movingAll, setMovingAll] = useState(false);
  const [movingItemId, setMovingItemId] = useState<string | null>(null);

  const handleMoveAll = async () => {
    if (items.length === 0) return;
    setMovingAll(true);
    await moveAllToCart();
    setMovingAll(false);
  };

  const handleMoveItem = async (id: string) => {
    setMovingItemId(id);
    await moveToCart(id);
    setMovingItemId(null);
  };

  const handleShare = (slug: string) => {
    const url = `${window.location.origin}/products/${slug}`;
    navigator.clipboard.writeText(url);
    toast.success('Product link copied to clipboard!');
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6 select-none">
          <Link to={ROUTES.CUSTOMER.HOME} className="hover:text-slate-800 transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <Link to={ROUTES.CUSTOMER.SHOP} className="hover:text-slate-800 transition-colors">
            Shop
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-800 font-bold">My Wishlist</span>
        </nav>

        {/* Guest Warning Banner if not logged in */}
        {!user && items.length > 0 && (
          <div className="mb-6 p-4 rounded-md bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-none">
            <div className="flex items-center gap-2.5 text-xs text-amber-900">
              <LogIn className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                You are currently managing a <strong>Guest Wishlist</strong>. Sign in to sync your saved items across your phone, tablet, and PC.
              </span>
            </div>
            <Link
              to={ROUTES.CUSTOMER.LOGIN}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs shrink-0 transition-colors"
            >
              Sign In to Sync
            </Link>
          </div>
        )}

        {/* Main Wishlist Card */}
        <div className="bg-white border border-slate-200 rounded-md p-6 shadow-none">
          {/* Header */}
          <div className="border-b border-slate-200 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <Heart className="w-5 h-5 fill-rose-500" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  My Wishlist
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  {totalCount} {totalCount === 1 ? 'item saved' : 'items saved'} for later purchase
                </p>
              </div>
            </div>

            {/* Top Action Buttons */}
            {items.length > 0 && (
              <div className="flex items-center gap-2.5">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={clearWishlist}
                  leftIcon={<Trash2 className="w-3.5 h-3.5 text-slate-400" />}
                >
                  Clear All
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  disabled={movingAll}
                  isLoading={movingAll}
                  onClick={handleMoveAll}
                  leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
                >
                  Move All to Cart
                </Button>
              </div>
            )}
          </div>

          {/* Empty State */}
          {!isLoading && items.length === 0 ? (
            <div className="py-16 text-center max-w-md mx-auto">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-400">
                <PackageOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <h2 className="text-lg font-bold text-slate-800 mb-1">
                Your wishlist is empty
              </h2>
              <p className="text-xs text-slate-500 mb-6 leading-relaxed">
                Explore our catalog of authentic electronics and gadgets, then click the heart icon on any product to save items you want to buy later.
              </p>
              <Link to={ROUTES.CUSTOMER.SHOP}>
                <Button
                  variant="primary"
                  size="md"
                  rightIcon={<ArrowRight className="w-4 h-4" />}
                >
                  Explore Catalog
                </Button>
              </Link>
            </div>
          ) : (
            /* Items Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {items.map((item) => {
                const isOutOfStock = !item.inStock;
                const hasDiscount = item.savings > 0;
                const discountPercent = hasDiscount
                  ? Math.round((item.savings / item.originalPrice) * 100)
                  : 0;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300 transition-all duration-150 group relative"
                  >
                    {/* Thumbnail */}
                    <div className="relative aspect-square w-full rounded-md bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center mb-3">
                      <Link
                        to={`/products/${item.productSlug}`}
                        className="w-full h-full flex items-center justify-center p-2"
                      >
                        <img
                          src={item.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80'}
                          alt={item.name}
                          className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                      </Link>

                      {/* Badges */}
                      <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
                        {hasDiscount && (
                          <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-white">
                            -{discountPercent}%
                          </span>
                        )}
                      </div>

                      {/* Remove Button on Top Right */}
                      <button
                        type="button"
                        onClick={() => removeFromWishlist(item.id)}
                        aria-label="Remove from wishlist"
                        title="Remove from wishlist"
                        className="absolute top-2 right-2 p-1.5 rounded-full z-10 bg-white/90 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer border border-slate-200/60"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Meta: Brand & Stock */}
                    <div className="flex items-center justify-between gap-1 mb-1 text-[11px]">
                      {item.brandName ? (
                        <span className="font-semibold text-amber-600 uppercase tracking-wide truncate">
                          {item.brandName}
                        </span>
                      ) : (
                        <span className="text-slate-400">Electronics</span>
                      )}

                      {isOutOfStock ? (
                        <span className="text-[10px] font-semibold text-rose-500 shrink-0 flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" /> Out of Stock
                        </span>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-600 shrink-0 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> In Stock
                        </span>
                      )}
                    </div>

                    {/* Title */}
                    <Link
                      to={`/products/${item.productSlug}`}
                      className="font-medium text-[13px] text-slate-800 hover:text-amber-600 transition-colors line-clamp-2 min-h-[38px] leading-snug mb-1"
                      title={item.name}
                    >
                      {item.name}
                    </Link>

                    {/* Variant Title if specified */}
                    {item.variantTitle && (
                      <p className="text-[11px] text-slate-400 truncate mb-1">
                        Variant: {item.variantTitle}
                      </p>
                    )}

                    {/* Ratings */}
                    <div className="flex items-center gap-1 mb-2">
                      <div className="flex items-center text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
                      </div>
                      <span className="text-xs font-bold text-slate-700">
                        {item.rating?.toFixed(1) || '4.8'}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        ({item.reviewCount || 12})
                      </span>
                    </div>

                    {/* Price and Savings */}
                    <div className="mb-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-base font-bold text-slate-900">
                          ${item.price.toFixed(2)}
                        </span>
                        {hasDiscount && (
                          <span className="text-xs text-slate-400 line-through">
                            ${item.originalPrice.toFixed(2)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Bottom Actions */}
                    <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center gap-2">
                      <button
                        type="button"
                        disabled={isOutOfStock || movingItemId === item.id}
                        onClick={() => handleMoveItem(item.id)}
                        className="flex-1 py-1.5 px-3 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] active:bg-[#151E30] text-white text-xs font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                      >
                        <ShoppingBag className="w-3.5 h-3.5" />
                        <span>{isOutOfStock ? 'Sold Out' : 'Move to Cart'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleShare(item.productSlug)}
                        title="Share product link"
                        className="p-1.5 rounded-md border border-slate-200 text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors cursor-pointer shrink-0"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WishlistPage;
