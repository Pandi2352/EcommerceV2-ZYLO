import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { productsService } from '@shared/api/products.service';
import type { ProductItem } from '@shared/types/product';
import { useCart } from '../../features/cart/context/CartContext';

export const FeaturedProductsGrid: React.FC = () => {
  const { addToCart } = useCart();
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchFeatured = async () => {
      try {
        setIsLoading(true);
        const res = await productsService.getFeaturedProducts(10);
        if (isMounted) {
          setProducts(res.items || []);
        }
      } catch (err) {
        console.error('Failed to load featured products:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };
    fetchFeatured();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleAddToCart = async (e: React.MouseEvent, prod: ProductItem) => {
    e.preventDefault();
    e.stopPropagation();
    await addToCart(prod, undefined, 1);
  };

  return (
    <section className="w-full max-w-[1320px] mx-auto px-4 py-6">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trending & Top Sellers
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Handpicked premium curated tech, horology, and lifestyle gear
          </p>
        </div>

        <Link
          to={ROUTES.CUSTOMER.SHOP}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          <span>View All in Shop</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Grid or Skeletons */}
      {isLoading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {Array.from({ length: 10 }).map((_, i) => (
            <div
              key={i}
              className="rounded-md border border-slate-200 bg-white p-3 space-y-2 animate-pulse"
            >
              <div className="aspect-square bg-slate-100 rounded-md" />
              <div className="h-3 bg-slate-100 rounded w-1/3" />
              <div className="h-4 bg-slate-100 rounded w-4/5" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-6 bg-slate-100 rounded w-full pt-2" />
            </div>
          ))}
        </div>
      ) : products.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
          {products.map((prod) => {
            const primaryImage =
              prod.images?.find((img) => img.isPrimary)?.url ||
              prod.thumbnailUrl ||
              prod.images?.[0]?.url ||
              'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=500&q=80';

            const effectivePrice =
              prod.salePrice && prod.salePrice > 0 ? prod.salePrice : prod.basePrice;
            const hasDiscount =
              prod.salePrice && prod.salePrice > 0 && prod.salePrice < prod.basePrice;
            const discountPercent = hasDiscount
              ? Math.round(((prod.basePrice - prod.salePrice!) / prod.basePrice) * 100)
              : 0;

            return (
              <div
                key={prod._id}
                className="group relative rounded-md border border-slate-200 bg-white p-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
              >
                {/* Image Wrapper */}
                <div className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-50 mb-2.5 flex items-center justify-center">
                  {hasDiscount && (
                    <span className="absolute top-2 left-2 z-10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white">
                      -{discountPercent}%
                    </span>
                  )}

                  <Link
                    to={`/products/${prod.slug}`}
                    className="w-full h-full flex items-center justify-center p-2"
                  >
                    <img
                      src={primaryImage}
                      alt={prod.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  </Link>
                </div>

                {/* Info */}
                <div className="flex flex-col flex-1">
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 uppercase tracking-wider truncate mb-1">
                    {prod.brandId?.name && (
                      <span className="font-semibold text-amber-600">{prod.brandId.name}</span>
                    )}
                    {prod.brandId?.name && prod.categoryId?.name && <span>•</span>}
                    {prod.categoryId?.name && <span className="truncate">{prod.categoryId.name}</span>}
                  </div>

                  <Link
                    to={`/products/${prod.slug}`}
                    className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-amber-600 transition-colors mb-1.5 min-h-[32px]"
                  >
                    {prod.name}
                  </Link>

                  {/* Rating */}
                  <div className="flex items-center gap-1 mb-2">
                    <div className="flex items-center text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400 stroke-amber-400" />
                    </div>
                    <span className="text-[11px] font-bold text-slate-700">
                      {prod.ratingAverage?.toFixed(1) || '4.8'}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      ({prod.ratingCount || 12})
                    </span>
                  </div>

                  {/* Price & Add button */}
                  <div className="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-xs sm:text-sm font-black text-slate-900">
                        ${effectivePrice.toFixed(2)}
                      </span>
                      {hasDiscount && (
                        <span className="text-[10px] text-slate-400 line-through ml-1.5">
                          ${prod.basePrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={(e) => handleAddToCart(e, prod)}
                      className="w-7 h-7 rounded-md bg-[#2A3B5C] hover:bg-[#1E2B43] text-white flex items-center justify-center transition-colors cursor-pointer"
                      title="Add to Cart"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
};

export default FeaturedProductsGrid;
