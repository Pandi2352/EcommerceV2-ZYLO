import React from 'react';
import { AlertTriangle, Package } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import { formatPrice } from '@shared/utils/currency';
import type { LowStockProductItem } from '@shared/types/analytics';

interface Props {
  products: LowStockProductItem[];
  outOfStockCount: number;
  currencySymbol: string;
  loading: boolean;
}

export const LowStockAlertCard: React.FC<Props> = ({
  products,
  outOfStockCount,
  currencySymbol,
  loading,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Low Stock Warnings
            </h3>
            <p className="text-[11px] text-slate-400">
              {outOfStockCount > 0 ? `${outOfStockCount} out of stock · ` : ''}
              {products.length} items needing restock
            </p>
          </div>
        </div>

        <Link
          to={ROUTES.PRODUCTS}
          className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="mt-3.5 divide-y divide-slate-100">
        {loading ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Checking catalog stock...
          </div>
        ) : products.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            <Package className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">Healthy Stock Levels</p>
            <p className="text-[11px] text-slate-400">No products are currently at or below reorder threshold.</p>
          </div>
        ) : (
          products.slice(0, 5).map((prod) => (
            <div key={prod._id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-9 h-9 rounded-md bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center shrink-0">
                  {prod.thumbnailUrl ? (
                    <img
                      src={prod.thumbnailUrl}
                      alt={prod.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-4 h-4 text-slate-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-slate-800 truncate">{prod.name}</p>
                  <p className="text-[10px] text-slate-400 font-mono">SKU: {prod.sku}</p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span
                  className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                    prod.stockQuantity <= 0
                      ? 'bg-rose-100 text-rose-700 font-extrabold'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {prod.stockQuantity <= 0 ? 'Out of Stock' : `${prod.stockQuantity} Left`}
                </span>
                <p className="text-[11px] font-mono font-medium text-slate-600 mt-0.5">
                  {formatPrice(prod.basePrice, { currencySymbol })}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default LowStockAlertCard;
