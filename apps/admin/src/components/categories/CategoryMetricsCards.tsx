import React from 'react';
import { FcFolder, FcTreeStructure, FcOk, FcRating } from 'react-icons/fc';
import type { CategoryStats } from '@shared/types/catalog';

export interface CategoryMetricsCardsProps {
  stats: CategoryStats | null;
  isLoading?: boolean;
}

export const CategoryMetricsCards: React.FC<CategoryMetricsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: 'Total Categories',
      value: stats?.total ?? 0,
      subtext: `${stats?.active ?? 0} active in catalog`,
      icon: <FcFolder className="w-8 h-8" />,
    },
    {
      title: 'Root Taxonomies',
      value: stats?.rootCount ?? 0,
      subtext: 'Top-level department groups',
      icon: <FcTreeStructure className="w-8 h-8" />,
    },
    {
      title: 'Subcategories',
      value: stats?.subCount ?? 0,
      subtext: 'Nested classification levels',
      icon: <FcOk className="w-8 h-8" />,
    },
    {
      title: 'Featured Departments',
      value: stats?.featuredCount ?? 0,
      subtext: 'Highlighted on storefront',
      icon: <FcRating className="w-8 h-8" />,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, idx) => (
        <div
          key={idx}
          className="bg-white border border-slate-200 rounded-md p-4 shadow-none flex items-center justify-between transition-colors hover:border-slate-300"
        >
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {card.title}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {isLoading ? '...' : card.value}
            </h3>
            <p className="text-xs text-slate-500 mt-1">{card.subtext}</p>
          </div>
          <div className="p-2.5 rounded-md bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0">
            {card.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CategoryMetricsCards;
