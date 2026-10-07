import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsService } from '@shared/api/products.service';
import type { ProductFacets } from '@shared/types/product';

export const BrandPartnersRow: React.FC = () => {
  const [facets, setFacets] = useState<ProductFacets | null>(null);

  useEffect(() => {
    let isMounted = true;
    productsService.getFacets().then((res) => {
      if (isMounted) setFacets(res);
    }).catch(console.error);
    return () => { isMounted = false; };
  }, []);

  const brands = facets?.brands || [];

  if (brands.length === 0) return null;

  return (
    <section className="w-full border-t border-b border-slate-100 bg-white py-3 my-1 select-none">
      <div className="max-w-[1320px] mx-auto px-4">
        <div className="flex items-center justify-between gap-6 overflow-x-auto no-scrollbar py-1">
          {brands.slice(0, 14).map((brand) => (
            <Link
              key={brand.id}
              to={`/shop?brandIds=${brand.id}`}
              className="flex items-center gap-1.5 shrink-0 px-2.5 py-1 rounded-md hover:bg-slate-50 transition-colors group"
            >
              {brand.logoUrl && (
                <img
                  src={brand.logoUrl}
                  alt={brand.name}
                  className="w-4 h-4 object-contain opacity-60 group-hover:opacity-100 transition-opacity"
                />
              )}
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 group-hover:text-slate-800 transition-colors">
                {brand.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BrandPartnersRow;
