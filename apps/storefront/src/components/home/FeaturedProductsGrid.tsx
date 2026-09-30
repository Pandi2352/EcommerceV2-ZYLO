import React from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { Star, ShoppingBag, Heart } from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  rating: number;
  reviewCount: number;
  image: string;
  badge?: string;
  inStock: boolean;
}

const FEATURED_PRODUCTS: ProductItem[] = [
  {
    id: 'ZYL-AUD-001',
    title: 'ZYLO Horizon ANC Wireless Headphones',
    category: 'Audio & Acoustics',
    price: 299.99,
    compareAtPrice: 349.99,
    rating: 4.9,
    reviewCount: 128,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80',
    badge: 'HOT',
    inStock: true,
  },
  {
    id: 'ZYL-WR-002',
    title: 'ZYLO Pulse Chrono Smartwatch Titanium',
    category: 'Wearables & Tech',
    price: 399.0,
    compareAtPrice: 449.0,
    rating: 4.8,
    reviewCount: 94,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    badge: 'NEW',
    inStock: true,
  },
  {
    id: 'ZYL-WRK-003',
    title: 'Minimalist Matte Aluminum Keyboard',
    category: 'Home & Workspace',
    price: 169.0,
    compareAtPrice: 199.0,
    rating: 4.9,
    reviewCount: 83,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    inStock: true,
  },
  {
    id: 'ZYL-APP-004',
    title: 'Precision Wool Blend Technical Trench Coat',
    category: 'Apparel & Streetwear',
    price: 420.0,
    compareAtPrice: 480.0,
    rating: 4.7,
    reviewCount: 52,
    image: 'https://images.unsplash.com/photo-1539533018447-63fcce667883?auto=format&fit=crop&w=600&q=80',
    badge: 'SAVE $60',
    inStock: true,
  },
  {
    id: 'ZYL-ELC-005',
    title: 'ZYLO Ultra-Slim 100W GaN Fast Charger',
    category: 'Electronics & Power',
    price: 79.99,
    compareAtPrice: 99.99,
    rating: 4.9,
    reviewCount: 210,
    image: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=600&q=80',
    badge: 'BESTSELLER',
    inStock: true,
  },
];

export const FeaturedProductsGrid: React.FC = () => {
  return (
    <section className="w-full max-w-[1320px] mx-auto px-4 py-5">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Trending & Top Sellers
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Handpicked premium gadgets and gear at special prices
          </p>
        </div>

        <Link
          to={ROUTES.CUSTOMER.SHOP}
          className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
        >
          <span>View All ({FEATURED_PRODUCTS.length}+)</span>
          <span>→</span>
        </Link>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {FEATURED_PRODUCTS.map((prod) => (
          <div
            key={prod.id}
            className="group relative rounded-md border border-slate-200 bg-white p-3 flex flex-col justify-between hover:border-slate-300 transition-colors"
          >
            {/* Image Wrapper */}
            <div className="relative w-full aspect-square rounded-md overflow-hidden bg-slate-50 mb-3">
              {prod.badge && (
                <span className="absolute top-2 left-2 z-10 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500 text-white">
                  {prod.badge}
                </span>
              )}

              <button
                type="button"
                className="absolute top-2 right-2 z-10 w-7 h-7 rounded-md bg-white/90 text-slate-500 hover:text-rose-500 hover:bg-white flex items-center justify-center border border-slate-200/60 transition-colors cursor-pointer"
                title="Save to Wishlist"
              >
                <Heart className="w-3.5 h-3.5" />
              </button>

              <img
                src={prod.image}
                alt={prod.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                loading="lazy"
              />
            </div>

            {/* Info */}
            <div className="flex flex-col flex-1">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                {prod.category}
              </span>
              <h4 className="text-xs font-bold text-slate-800 line-clamp-2 mt-1 leading-snug group-hover:text-amber-600 transition-colors">
                {prod.title}
              </h4>

              {/* Rating */}
              <div className="flex items-center gap-1.5 mt-1.5">
                <div className="flex items-center text-amber-400">
                  <Star className="w-3 h-3 fill-amber-400" />
                </div>
                <span className="text-[11px] font-bold text-slate-700">{prod.rating}</span>
                <span className="text-[10px] text-slate-400">({prod.reviewCount})</span>
              </div>

              {/* Price & Add button */}
              <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-xs sm:text-sm font-black text-slate-900">
                    ${prod.price.toFixed(2)}
                  </span>
                  {prod.compareAtPrice && (
                    <span className="text-[10px] text-slate-400 line-through ml-1.5">
                      ${prod.compareAtPrice.toFixed(2)}
                    </span>
                  )}
                </div>

                <Link
                  to={ROUTES.CUSTOMER.SHOP}
                  className="w-7 h-7 rounded-md bg-amber-50 hover:bg-amber-500 text-amber-600 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                  title="Add to Cart"
                >
                  <ShoppingBag className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeaturedProductsGrid;
