import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ChartCard from '@shared/charts/ChartCard';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface RecentCategoriesCardProps {
  data: CategoryOverviewData;
}

/** Displays recently added or updated catalog categories */
export const RecentCategoriesCard: React.FC<RecentCategoriesCardProps> = ({ data }) => {
  const categories = data.recentCategories;

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Recent Categories"
      subtitle="Newly registered catalog classifications"
      actions={
        <Link
          to="/categories"
          className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700"
        >
          View all
          <ArrowRight className="w-3 h-3" />
        </Link>
      }
    >
      <div className="divide-y divide-slate-100">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/categories?search=${encodeURIComponent(cat.name)}`}
            className="py-2.5 flex items-center justify-between group hover:bg-slate-50/80 -mx-3 px-3 rounded transition-colors"
          >
            <div className="min-w-0 pr-2">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors truncate">
                  {cat.name}
                </span>
                {cat.badge && (
                  <span className="px-1.5 py-0.2 text-[9px] font-bold rounded bg-indigo-50 text-indigo-700 border border-indigo-200 uppercase shrink-0">
                    {cat.badge.text}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-slate-400 mt-0.5">
                Level {cat.level} {cat.isFeatured && '· Featured'}
              </div>
            </div>
            <div className="text-right shrink-0">
              <span
                className={`inline-block px-1.5 py-0.5 text-[10px] font-medium rounded ${
                  cat.status === 'ACTIVE'
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {cat.status}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </ChartCard>
  );
};

export default RecentCategoriesCard;
