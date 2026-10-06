import React from 'react';
import { Link } from 'react-router-dom';
import {
  FcPackage,
  FcApproval,
  FcFile,
  FcCurrencyExchange,
  FcHighPriority,
  FcRating,
} from 'react-icons/fc';
import type { ProductOverviewData } from '@shared/types/product';

interface ProductsOverviewStatsProps {
  data: ProductOverviewData;
}

export const ProductsOverviewStats: React.FC<ProductsOverviewStatsProps> = ({ data }) => {
  const { summary } = data;
  const livePct = summary.totalProducts > 0 ? Math.round((summary.published / summary.totalProducts) * 100) : 0;
  const attentionCount = summary.lowStock + summary.outOfStock;

  const tiles = [
    {
      label: 'Total Products',
      value: summary.totalProducts,
      context: `${summary.totalStockUnits.toLocaleString()} total units in stock`,
      icon: <FcPackage className="w-8 h-8" />,
      to: '/products',
    },
    {
      label: 'Live / Published',
      value: summary.published,
      context: `${livePct}% active in storefront`,
      icon: <FcApproval className="w-8 h-8" />,
      to: '/products',
    },
    {
      label: 'Draft / Staging',
      value: summary.draft,
      context: `${summary.archived} archived items`,
      icon: <FcFile className="w-8 h-8" />,
      to: '/products',
    },
    {
      label: 'Inventory Valuation',
      value: `$${Math.round(summary.totalInventoryValue).toLocaleString()}`,
      context: `Avg price $${summary.averagePrice.toFixed(2)}`,
      icon: <FcCurrencyExchange className="w-8 h-8" />,
      to: '/products',
    },
    {
      label: 'Stock Attention',
      value: attentionCount,
      context: `${summary.lowStock} low · ${summary.outOfStock} out of stock`,
      icon: <FcHighPriority className="w-8 h-8" />,
      to: '/products',
      attention: attentionCount > 0,
    },
    {
      label: 'Featured Spotlight',
      value: summary.featured,
      context: `${summary.newArrivals} new arrival badges`,
      icon: <FcRating className="w-8 h-8" />,
      to: '/products',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      {tiles.map((tile, i) => (
        <Link
          key={i}
          to={tile.to}
          className="group bg-white border border-slate-200 rounded-md p-3.5 shadow-none hover:border-slate-300 transition-colors flex flex-col justify-between"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500">
              {tile.label}
            </span>
            <div className="p-1.5 rounded-md bg-slate-50 border border-slate-100 group-hover:bg-slate-100 transition-colors">
              {tile.icon}
            </div>
          </div>
          <div>
            <div
              className={`text-2xl font-bold tracking-tight ${
                tile.attention ? 'text-rose-600' : 'text-slate-900'
              }`}
            >
              {tile.value}
            </div>
            <p className="text-[11px] text-slate-500 mt-1 truncate font-normal">
              {tile.context}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default ProductsOverviewStats;
