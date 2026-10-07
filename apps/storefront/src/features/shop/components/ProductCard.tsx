import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  ShoppingBag,
  Eye,
  Heart,
} from 'lucide-react';
import type { ProductItem } from '@shared/types/product';
import Button from '@shared/ui/Button';
import { useCart } from '../../cart/context/CartContext';
import { useWishlist } from '../../wishlist/context/WishlistContext';

interface ProductCardProps {
  product: ProductItem;
  viewMode?: 'grid' | 'list';
  onQuickView: (product: ProductItem) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  viewMode = 'grid',
  onQuickView,
}) => {
  const { addToCart } = useCart();
  const { isInWishlist, toggleWishlist } = useWishlist();
  const [isHovered, setIsHovered] = useState(false);

  const productId = product._id;
  const isWishlisted = isInWishlist(productId);

  const primaryImage =
    product.images?.find((img) => img.isPrimary)?.url ||
    product.thumbnailUrl ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80';

  const secondaryImage =
    product.images?.find((img) => !img.isPrimary)?.url ||
    product.images?.[1]?.url ||
    primaryImage;

  const effectivePrice =
    product.salePrice && product.salePrice > 0 ? product.salePrice : product.basePrice;
  const hasDiscount =
    product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const isOutOfStock = product.trackInventory && product.stockQuantity <= 0;

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock) return;
    await addToCart(product, undefined, 1);
  };

  const handleToggleWishlist = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleWishlist(product);
  };

  const handleQuickViewClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onQuickView(product);
  };

  // LIST VIEW LAYOUT
  if (viewMode === 'list') {
    return (
      <div
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col sm:flex-row gap-4 p-4 rounded-md border border-slate-200 bg-white hover:border-slate-300 transition-all duration-150"
      >
        {/* Thumbnail */}
        <div className="relative w-full sm:w-48 h-48 rounded-md bg-slate-50 border border-slate-100 shrink-0 overflow-hidden flex items-center justify-center">
          <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center p-2">
            <img
              src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
              alt={product.name}
              className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          </Link>

          {/* Badges */}
          <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none">
            {hasDiscount && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-white">
                -{discountPercent}%
              </span>
            )}
            {product.isNewArrival && (
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white">
                NEW
              </span>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            type="button"
            onClick={handleToggleWishlist}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-colors cursor-pointer ${
              isWishlisted
                ? 'bg-rose-50 text-rose-500'
                : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500'
            }`}
          >
            <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-1">
              <div className="flex items-center gap-1.5 text-xs">
                {product.brandId?.name && (
                  <span className="font-semibold text-amber-600 uppercase tracking-wide text-[11px]">
                    {product.brandId.name}
                  </span>
                )}
                {product.brandId?.name && product.categoryId?.name && (
                  <span className="text-slate-300">•</span>
                )}
                {product.categoryId?.name && (
                  <span className="text-slate-500 text-[11px]">{product.categoryId.name}</span>
                )}
              </div>
              <span className="font-mono text-[10px] text-slate-400">SKU: {product.sku}</span>
            </div>

            <Link
              to={`/products/${product.slug}`}
              className="block font-semibold text-slate-800 hover:text-amber-600 transition-colors text-base line-clamp-1 mb-1.5"
            >
              {product.name}
            </Link>

            <div className="flex items-center gap-1.5 mb-2">
              <div className="flex items-center text-amber-500">
                <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-500" />
                <span className="ml-1 text-xs font-bold text-slate-700">
                  {product.ratingAverage?.toFixed(1) || '4.8'}
                </span>
              </div>
              <span className="text-xs text-slate-400">
                ({product.ratingCount || 10})
              </span>
            </div>

            <p className="text-xs text-slate-500 line-clamp-2 mb-3">
              {product.shortDescription || product.description || 'Premium craftsmanship engineered for everyday life.'}
            </p>
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-100">
            <div className="flex items-baseline gap-2">
              <span className="text-lg font-bold text-slate-900">
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <span className="text-xs text-slate-400 line-through">
                  ${product.basePrice.toFixed(2)}
                </span>
              )}
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleQuickViewClick}
                leftIcon={<Eye className="w-3.5 h-3.5" />}
              >
                Quick View
              </Button>
              <Button
                variant="primary"
                size="sm"
                disabled={isOutOfStock}
                onClick={handleAddToCart}
                leftIcon={<ShoppingBag className="w-3.5 h-3.5" />}
              >
                {isOutOfStock ? 'Sold Out' : 'Add to Cart'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // GRID VIEW LAYOUT (Standard)
  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative flex flex-col rounded-md border border-slate-200 bg-white p-3 hover:border-slate-300 transition-all duration-150"
    >
      {/* Thumbnail Container */}
      <div className="relative aspect-square w-full rounded-md bg-slate-50 border border-slate-100 overflow-hidden flex items-center justify-center mb-3">
        <Link to={`/products/${product.slug}`} className="w-full h-full flex items-center justify-center p-2">
          <img
            src={isHovered && secondaryImage !== primaryImage ? secondaryImage : primaryImage}
            alt={product.name}
            className="w-full h-full object-contain transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        </Link>

        {/* Badges Overlay */}
        <div className="absolute top-2 left-2 flex flex-col gap-1 pointer-events-none z-10">
          {hasDiscount && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-amber-500 text-white">
              -{discountPercent}%
            </span>
          )}
          {product.isNewArrival && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-emerald-600 text-white">
              NEW
            </span>
          )}
          {product.isFeatured && (
            <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-600 text-white">
              FEATURED
            </span>
          )}
        </div>

        {/* Wishlist Button */}
        <button
          type="button"
          onClick={handleToggleWishlist}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-2 right-2 p-1.5 rounded-full z-10 transition-colors cursor-pointer ${
            isWishlisted
              ? 'bg-rose-50 text-rose-500'
              : 'bg-white/90 hover:bg-white text-slate-400 hover:text-rose-500'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-rose-500 text-rose-500' : ''}`} />
        </button>

        {/* Quick View Button on Hover */}
        <div className="absolute inset-x-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex justify-center z-10">
          <button
            type="button"
            onClick={handleQuickViewClick}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-white/95 text-slate-800 text-xs font-semibold border border-slate-200 hover:bg-white hover:text-amber-600 transition-colors cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Meta: Category & Brand */}
      <div className="flex items-center justify-between gap-1 mb-1 text-[11px]">
        <div className="flex items-center gap-1 truncate text-slate-500">
          {product.brandId?.name && (
            <span className="font-semibold text-amber-600 uppercase tracking-wide truncate">
              {product.brandId.name}
            </span>
          )}
          {product.brandId?.name && product.categoryId?.name && (
            <span className="text-slate-300">•</span>
          )}
          {product.categoryId?.name && (
            <span className="truncate">{product.categoryId.name}</span>
          )}
        </div>

        {isOutOfStock ? (
          <span className="text-[10px] font-semibold text-rose-500 shrink-0">Sold Out</span>
        ) : (
          <span className="text-[10px] font-semibold text-emerald-600 shrink-0">In Stock</span>
        )}
      </div>

      {/* Title */}
      <Link
        to={`/products/${product.slug}`}
        className="font-medium text-[13px] text-slate-800 hover:text-amber-600 transition-colors line-clamp-2 min-h-[38px] leading-snug mb-2"
        title={product.name}
      >
        {product.name}
      </Link>

      {/* Ratings */}
      <div className="flex items-center gap-1 mb-3">
        <div className="flex items-center text-amber-400">
          <Star className="w-3.5 h-3.5 fill-amber-400 stroke-amber-400" />
        </div>
        <span className="text-xs font-bold text-slate-700">
          {product.ratingAverage?.toFixed(1) || '4.8'}
        </span>
        <span className="text-[11px] text-slate-400">
          ({product.ratingCount || 12})
        </span>
      </div>

      {/* Footer: Price & Add to Cart button */}
      <div className="mt-auto pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
        <div className="flex flex-col">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-slate-900">
              ${effectivePrice.toFixed(2)}
            </span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through">
                ${product.basePrice.toFixed(2)}
              </span>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={isOutOfStock}
          onClick={handleAddToCart}
          title={isOutOfStock ? 'Out of stock' : 'Add to cart'}
          className="p-2 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] active:bg-[#151E30] text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer shrink-0"
        >
          <ShoppingBag className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default ProductCard;
