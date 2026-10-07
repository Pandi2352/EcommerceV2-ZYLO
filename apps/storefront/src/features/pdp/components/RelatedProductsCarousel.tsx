import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { ProductItem } from '@shared/types/product';
import ProductCard from '../../shop/components/ProductCard';
import { ROUTES } from '../../../routes/routePaths';

interface RelatedProductsCarouselProps {
  products: ProductItem[];
  categoryName?: string;
  categoryId?: string;
  onQuickView: (product: ProductItem) => void;
}

export const RelatedProductsCarousel: React.FC<RelatedProductsCarouselProps> = ({
  products,
  categoryName,
  categoryId,
  onQuickView,
}) => {
  if (!products || products.length === 0) return null;

  return (
    <section className="space-y-4 pt-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-tight">
            You May Also Like
          </h2>
        </div>

        {categoryId && (
          <Link
            to={`/shop?categoryIds=${categoryId}`}
            className="text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors"
          >
            <span>More in {categoryName || 'this category'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((prod) => (
          <ProductCard
            key={prod._id}
            product={prod}
            viewMode="grid"
            onQuickView={onQuickView}
          />
        ))}
      </div>
    </section>
  );
};

export default RelatedProductsCarousel;
