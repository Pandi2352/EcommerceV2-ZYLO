import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  X,
  Star,
  ShoppingBag,
  Check,
  AlertCircle,
  ExternalLink,
  ShieldCheck,
  Truck,
  RotateCcw,
} from 'lucide-react';
import type { ProductItem } from '@shared/types/product';
import Button from '@shared/ui/Button';
import Badge from '@shared/ui/Badge';
import { toast } from '@shared/ui/toastStore';

interface ProductQuickViewModalProps {
  product: ProductItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ProductQuickViewModal: React.FC<ProductQuickViewModalProps> = ({
  product,
  isOpen,
  onClose,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    if (product) {
      setSelectedImageIndex(0);
      setQuantity(1);
    }
  }, [product]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [isOpen, onClose]);

  if (!isOpen || !product) return null;

  const images = product.images && product.images.length > 0
    ? product.images.map((img) => img.url)
    : [product.thumbnailUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80'];

  const effectivePrice = product.salePrice && product.salePrice > 0 ? product.salePrice : product.basePrice;
  const hasDiscount = product.salePrice && product.salePrice > 0 && product.salePrice < product.basePrice;
  const discountPercent = hasDiscount
    ? Math.round(((product.basePrice - product.salePrice!) / product.basePrice) * 100)
    : 0;

  const isOutOfStock = product.trackInventory && product.stockQuantity <= 0;
  const isLowStock = product.trackInventory && product.stockQuantity > 0 && product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = () => {
    toast.success(`Added ${quantity} × "${product.name}" to your cart!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity duration-200"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div
        role="dialog"
        aria-modal="true"
        className="relative bg-white border border-slate-200 rounded-md w-full max-w-3xl max-h-[90vh] overflow-y-auto z-10 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute right-3.5 top-3.5 p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors z-20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
          {/* Left Column: Gallery */}
          <div className="flex flex-col gap-3">
            <div className="relative aspect-square w-full rounded-md border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden">
              <img
                src={images[selectedImageIndex] || images[0]}
                alt={product.name}
                className="w-full h-full object-contain p-3 transition-all duration-300"
              />

              {/* Discount / Badges */}
              <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                {hasDiscount && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-amber-500 text-white">
                    -{discountPercent}% OFF
                  </span>
                )}
                {product.isNewArrival && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-emerald-600 text-white">
                    NEW
                  </span>
                )}
                {product.isFeatured && (
                  <span className="px-2 py-0.5 text-xs font-bold rounded-md bg-indigo-600 text-white">
                    FEATURED
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Navigation */}
            {images.length > 1 && (
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {images.map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-16 h-16 rounded-md border shrink-0 overflow-hidden transition-all cursor-pointer ${
                      selectedImageIndex === idx
                        ? 'border-amber-500 ring-2 ring-amber-500/20'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={imgUrl}
                      alt={`Thumbnail ${idx + 1}`}
                      className="w-full h-full object-contain p-1"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Trust Assurances */}
            <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-[11px] text-slate-500">
              <div className="flex flex-col items-center text-center p-2 rounded-md bg-slate-50 border border-slate-100">
                <Truck className="w-4 h-4 text-slate-600 mb-1" />
                <span>Express Delivery</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-md bg-slate-50 border border-slate-100">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1" />
                <span>Original Brand</span>
              </div>
              <div className="flex flex-col items-center text-center p-2 rounded-md bg-slate-50 border border-slate-100">
                <RotateCcw className="w-4 h-4 text-slate-600 mb-1" />
                <span>30-Day Return</span>
              </div>
            </div>
          </div>

          {/* Right Column: Product Details */}
          <div className="flex flex-col">
            {/* Category and Brand row */}
            <div className="flex items-center gap-2 mb-1 text-xs">
              {product.brandId?.name && (
                <span className="font-semibold text-amber-600 uppercase tracking-wider">
                  {product.brandId.name}
                </span>
              )}
              {product.brandId?.name && product.categoryId?.name && (
                <span className="text-slate-300">•</span>
              )}
              {product.categoryId?.name && (
                <span className="text-slate-500">{product.categoryId.name}</span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-lg font-bold text-slate-900 leading-snug mb-1.5">
              {product.name}
            </h2>

            {/* SKU & Ratings */}
            <div className="flex items-center justify-between text-xs text-slate-500 mb-3 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center text-amber-500">
                  <Star className="w-4 h-4 fill-amber-400 stroke-amber-500" />
                  <span className="ml-1 font-bold text-slate-800">
                    {product.ratingAverage?.toFixed(1) || '4.8'}
                  </span>
                </div>
                <span className="text-slate-400">
                  ({product.ratingCount || 12} reviews)
                </span>
              </div>
              <span className="font-mono text-slate-400">SKU: {product.sku}</span>
            </div>

            {/* Price section */}
            <div className="flex items-baseline gap-2.5 mb-4">
              <span className="text-2xl font-black text-slate-900">
                ${effectivePrice.toFixed(2)}
              </span>
              {hasDiscount && (
                <>
                  <span className="text-sm text-slate-400 line-through">
                    ${product.basePrice.toFixed(2)}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    Save ${(product.basePrice - product.salePrice!).toFixed(2)}
                  </span>
                </>
              )}
            </div>

            {/* Description */}
            <p className="text-xs text-slate-600 leading-relaxed mb-4 line-clamp-3">
              {product.shortDescription || product.description || 'Premium build designed for everyday performance, longevity, and modern lifestyle ergonomics.'}
            </p>

            {/* Stock status indicator */}
            <div className="mb-4">
              {isOutOfStock ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-rose-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Out of Stock</span>
                </div>
              ) : isLowStock ? (
                <div className="flex items-center gap-1.5 text-xs font-medium text-amber-600">
                  <AlertCircle className="w-4 h-4" />
                  <span>Only {product.stockQuantity} items left in stock</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-600">
                  <Check className="w-4 h-4" />
                  <span>In Stock {product.stockQuantity ? `(${product.stockQuantity} units available)` : ''}</span>
                </div>
              )}
            </div>

            {/* Specifications preview if present */}
            {product.specifications && product.specifications.length > 0 && (
              <div className="mb-4 p-2.5 rounded-md bg-slate-50 border border-slate-100 text-xs">
                <span className="font-bold text-slate-700 block mb-1">Key Specs:</span>
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {product.specifications.slice(0, 4).map((spec, i) => (
                    <div key={i} className="flex items-center justify-between text-slate-600 truncate">
                      <span className="text-slate-400">{spec.key}:</span>
                      <span className="font-medium text-slate-800 ml-1 truncate">{spec.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and Actions */}
            <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="flex items-center border border-slate-200 rounded-md overflow-hidden bg-white">
                  <button
                    type="button"
                    disabled={quantity <= 1 || isOutOfStock}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="w-10 text-center text-xs font-bold text-slate-800">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    disabled={isOutOfStock || (product.trackInventory && quantity >= product.stockQuantity)}
                    onClick={() => setQuantity((q) => q + 1)}
                    className="w-8 h-9 flex items-center justify-center text-slate-600 hover:bg-slate-50 disabled:opacity-40 transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart button */}
                <Button
                  variant="primary"
                  fullWidth
                  disabled={isOutOfStock}
                  onClick={handleAddToCart}
                  leftIcon={<ShoppingBag className="w-4 h-4" />}
                >
                  {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
                </Button>
              </div>

              {/* View Full Details Link */}
              <Link
                to={`/products/${product.slug}`}
                onClick={onClose}
                className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-amber-600 transition-colors py-1"
              >
                <span>View Full Product Details</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductQuickViewModal;
