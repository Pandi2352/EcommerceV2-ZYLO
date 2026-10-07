import React from 'react';
import { Layers } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../routes/routePaths';
import type { DashboardTopCategory } from '@shared/types/analytics';

interface Props {
  categories: DashboardTopCategory[];
  loading: boolean;
}

export const TopCategoriesCard: React.FC<Props> = ({ categories, loading }) => {
  const maxProducts = Math.max(...categories.map((c) => c.productCount), 1);

  return (
    <div className="bg-white border border-slate-200 rounded-md p-5 select-none">
      <div className="flex items-center justify-between pb-3.5 border-b border-slate-100">
        <div>
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
            Top Categories
          </h3>
          <p className="text-[11px] text-slate-400">
            Catalog inventory concentration
          </p>
        </div>
        <Link
          to={ROUTES.CATEGORIES}
          className="text-xs font-medium text-slate-400 hover:text-indigo-600 transition-colors"
        >
          View all
        </Link>
      </div>

      <div className="mt-4 space-y-3">
        {loading ? (
          <div className="py-6 text-center text-xs text-slate-400">
            Loading categories...
          </div>
        ) : categories.length === 0 ? (
          <div className="py-6 text-center text-xs text-slate-400">
            <Layers className="w-8 h-8 text-slate-200 mx-auto mb-1.5" />
            <p className="font-semibold text-slate-700">No categories found</p>
          </div>
        ) : (
          categories.slice(0, 6).map((cat, idx) => {
            const pct = Math.round((cat.productCount / maxProducts) * 100);
            return (
              <div key={cat._id} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700 truncate max-w-[170px]">
                    <span className="text-slate-400 font-semibold mr-1.5">{idx + 1}.</span>
                    {cat.name}
                  </span>
                  <span className="text-[11px] font-bold text-slate-500 shrink-0">
                    {cat.productCount} item{cat.productCount !== 1 ? 's' : ''}
                  </span>
                </div>
                {/* Progress bar */}
                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500"
                    style={{ width: `${Math.max(pct, 6)}%` }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default TopCategoriesCard;
