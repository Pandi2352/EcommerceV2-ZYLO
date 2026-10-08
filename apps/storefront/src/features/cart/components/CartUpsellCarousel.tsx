import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Check, Sparkles, Loader2 } from 'lucide-react';
import { productsService } from '@shared/api/products.service';
import type { ProductItem } from '@shared/types/product';
import { useCart } from '../context/CartContext';
import { useSettings } from '../../settings/context/SettingsContext';
import { toast } from '@shared/ui/Toast';

interface CartUpsellCarouselProps {
  onItemAdded?: () => void;
  className?: string;
  title?: string;
}

export const CartUpsellCarousel: React.FC<CartUpsellCarouselProps> = ({
  onItemAdded,
  className = '',
  title = 'Frequently Bought Together',
}) => {
  const { items, addToCart } = useCart();
  const { formatPrice } = useSettings();

  const [upsellProducts, setUpsellProducts] = useState<ProductItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [addingId, setAddingId] = useState<string | null>(null);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    let isMounted = true;
    const fetchUpsells = async () => {
      try {
        setLoading(true);
        const res = await productsService.getFeaturedProducts(10);
        if (isMounted) {
          // Filter out items already in the cart
          const cartProductIds = new Set(items.map((i) => i.productId));
          const available = (res.items || []).filter(
            (p) => !cartProductIds.has(p._id),
          );
          setUpsellProducts(available.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load upsells:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchUpsells();
    return () => {
      isMounted = false;
    };
  }, [items]);

  const handleAddUpsell = async (product: ProductItem) => {
    const prodId = product._id;
    try {
      setAddingId(prodId);
      const success = await addToCart(product, undefined, 1);
      if (success) {
        setAddedIds((prev) => new Set([...prev, prodId]));
        toast.success(`Added ${product.name} to your cart!`);
        if (onItemAdded) onItemAdded();
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add item');
    } finally {
      setAddingId(null);
    }
  };

  if (loading) {
    return (
      <div className={`p-4 border-t border-slate-200 bg-slate-50/50 ${className}`}>
        <div className="flex items-center gap-2 text-xs font-bold text-slate-700 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-spin" />
          <span>Curating add-ons for your cart...</span>
        </div>
      </div>
    );
  }

  if (upsellProducts.length === 0) return null;

  return (
    <div className={`p-4 border-t border-slate-200 bg-slate-50/70 select-none ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <h4 className="text-xs font-bold text-slate-900 tracking-tight">{title}</h4>
        </div>
        <span className="text-[10px] text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-full font-semibold">
          1-Click Add
        </span>
      </div>

      {/* Horizontal Scrollable Row */}
      <div className="flex gap-2.5 overflow-x-auto pb-1 scrollbar-thin">
        {upsellProducts.map((prod) => {
          const prodId = prod._id;
          const isAdding = addingId === prodId;
          const isAdded = addedIds.has(prodId);
          const image = prod.images?.[0]?.url || 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=300&q=80';
          const price = prod.salePrice ?? prod.basePrice;

          return (
            <div
              key={prodId}
              className="w-48 shrink-0 bg-white border border-slate-200 rounded-lg p-2.5 flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-xs"
            >
              <div className="flex gap-2 items-start">
                <Link
                  to={`/products/${prod.slug}`}
                  className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-md shrink-0 flex items-center justify-center overflow-hidden p-1"
                >
                  <img
                    src={image}
                    alt={prod.name}
                    className="w-full h-full object-contain"
                    loading="lazy"
                  />
                </Link>
                <div className="min-w-0 flex-1">
                  <Link
                    to={`/products/${prod.slug}`}
                    className="text-[11px] font-bold text-slate-800 line-clamp-2 hover:text-amber-600 transition-colors leading-tight"
                    title={prod.name}
                  >
                    {prod.name}
                  </Link>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="text-xs font-extrabold text-slate-900">
                      {formatPrice(price)}
                    </span>
                    {prod.basePrice > price && (
                      <span className="text-[10px] text-slate-400 line-through">
                        {formatPrice(prod.basePrice)}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Button */}
              <button
                type="button"
                disabled={isAdding || isAdded}
                onClick={() => handleAddUpsell(prod)}
                className={`mt-2.5 w-full py-1 px-2 rounded text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isAdded
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white shadow-none'
                }`}
              >
                {isAdding ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : isAdded ? (
                  <>
                    <Check className="w-3 h-3 text-emerald-600" />
                    <span>Added</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 text-amber-400" />
                    <span>Add to Cart</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CartUpsellCarousel;
