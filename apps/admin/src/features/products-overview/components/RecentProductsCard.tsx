import React from 'react';
import { Link } from 'react-router-dom';
import { Package, ArrowRight, Star, Sparkles } from 'lucide-react';
import type { ProductOverviewData } from '@shared/types/product';

interface RecentProductsCardProps {
  data: ProductOverviewData;
}

export const RecentProductsCard: React.FC<RecentProductsCardProps> = ({ data }) => {
  const { recentProducts } = data;

  return (
    <div className="rounded-md border border-slate-200 bg-white overflow-hidden shadow-none">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50/75 px-4 py-3">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-800">
            Recent Catalog Additions
          </h3>
          <p className="text-xs text-slate-500">
            Latest items provisioned in the central product repository
          </p>
        </div>
        <Link
          to="/products"
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 hover:text-blue-800 transition-colors"
        >
          View All Products
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-200 bg-slate-50/50 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            <tr>
              <th className="py-2.5 px-4">Product</th>
              <th className="py-2.5 px-3">Brand & Category</th>
              <th className="py-2.5 px-3">Price</th>
              <th className="py-2.5 px-3">Stock Units</th>
              <th className="py-2.5 px-3">Status</th>
              <th className="py-2.5 px-4 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {recentProducts.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="py-2.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded border border-slate-200 bg-white flex items-center justify-center overflow-hidden shrink-0">
                      {p.thumbnailUrl ? (
                        <img
                          src={p.thumbnailUrl}
                          alt={p.name}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = 'none';
                          }}
                        />
                      ) : (
                        <Package className="w-5 h-5 text-slate-300" />
                      )}
                    </div>
                    <div className="min-w-0 max-w-xs">
                      <p className="font-semibold text-slate-900 truncate flex items-center gap-1.5">
                        {p.name}
                        {p.isFeatured && (
                          <Star className="w-3 h-3 text-amber-500 fill-amber-400 shrink-0" />
                        )}
                        {p.isNewArrival && (
                          <Sparkles className="w-3 h-3 text-emerald-500 shrink-0" />
                        )}
                      </p>
                      <p className="font-mono text-[11px] text-slate-400">{p.sku}</p>
                    </div>
                  </div>
                </td>

                <td className="py-2.5 px-3">
                  <span className="font-medium text-slate-800 block">{p.brandName}</span>
                  <span className="text-[11px] text-slate-500 block">{p.categoryName}</span>
                </td>

                <td className="py-2.5 px-3">
                  <div className="font-semibold text-slate-900">
                    ${p.basePrice.toFixed(2)}
                  </div>
                  {p.salePrice && p.salePrice < p.basePrice && (
                    <span className="text-[10px] text-rose-600 font-medium block">
                      Sale: ${p.salePrice.toFixed(2)}
                    </span>
                  )}
                </td>

                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold ${
                      p.stockQuantity === 0
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : p.stockQuantity <= 5
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {p.stockQuantity} units
                  </span>
                </td>

                <td className="py-2.5 px-3">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded text-[10.5px] font-medium ${
                      p.status === 'PUBLISHED'
                        ? 'bg-emerald-50 text-emerald-700'
                        : p.status === 'DRAFT'
                        ? 'bg-slate-100 text-slate-600'
                        : 'bg-rose-50 text-rose-600'
                    }`}
                  >
                    {p.status}
                  </span>
                </td>

                <td className="py-2.5 px-4 text-right">
                  <Link
                    to={`/products?search=${encodeURIComponent(p.name)}`}
                    className="inline-flex items-center text-xs text-blue-600 hover:text-blue-800 font-medium hover:underline"
                  >
                    Manage
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RecentProductsCard;
