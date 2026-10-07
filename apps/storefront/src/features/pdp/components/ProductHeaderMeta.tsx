import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight, Star, ShieldCheck } from 'lucide-react';
import { ROUTES } from '../../../routes/routePaths';
import type { ProductItem } from '@shared/types/product';

interface ProductHeaderMetaProps {
  product: ProductItem;
  effectiveSku: string;
}

export const ProductHeaderMeta: React.FC<ProductHeaderMetaProps> = ({
  product,
  effectiveSku,
}) => {
  const category = product.categoryId;
  const brand = product.brandId;

  return (
    <div className="space-y-2.5">
      {/* 1. Brand Chip & Verification */}
      <div className="flex items-center gap-2">
        {brand?.name && (
          <Link
            to={`/shop?brandIds=${brand._id}`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 text-xs font-bold uppercase tracking-wider transition-colors"
          >
            {brand.logoUrl && (
              <img
                src={brand.logoUrl}
                alt={brand.name}
                className="w-3.5 h-3.5 object-contain"
              />
            )}
            <span>{brand.name}</span>
          </Link>
        )}
        <span className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Verified Merchant</span>
        </span>
      </div>

      {/* 3. Product Title */}
      <h1 className="text-xl sm:text-2xl lg:text-3xl font-black text-slate-900 leading-tight tracking-tight">
        {product.name}
      </h1>

      {/* 4. Rating, Reviews & SKU Bar */}
      <div className="flex items-center flex-wrap justify-between gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {/* Star Rating */}
          <div className="flex items-center text-amber-400">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.round(product.ratingAverage || 4.8)
                    ? 'fill-amber-400 stroke-amber-400'
                    : 'stroke-slate-300 text-slate-300'
                }`}
              />
            ))}
          </div>
          <span className="font-bold text-slate-800">
            {product.ratingAverage ? product.ratingAverage.toFixed(1) : '4.8'}
          </span>
          <span className="text-slate-400">•</span>
          <a
            href="#reviews"
            className="text-slate-600 hover:text-amber-600 hover:underline transition-colors"
          >
            {product.ratingCount || 24} customer reviews
          </a>
        </div>

        <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
          <span>SKU: {effectiveSku || product.sku}</span>
          {product.barcode && <span>UPC: {product.barcode}</span>}
        </div>
      </div>
    </div>
  );
};

export default ProductHeaderMeta;
