import React from 'react';
import { FcFolder, FcTreeStructure, FcOk, FcRating } from 'react-icons/fc';
import type { CategoryStats } from '@shared/types/catalog';
import KpiMetricsGrid from '@shared/ui/KpiMetricsGrid';

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

  return <KpiMetricsGrid cards={cards} isLoading={isLoading} />;
};

export default CategoryMetricsCards;
