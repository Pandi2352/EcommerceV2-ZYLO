import React from 'react';
import { Link } from 'react-router-dom';
import { FcFolder, FcWorkflow, FcTreeStructure, FcRating, FcMenu, FcCheckmark } from 'react-icons/fc';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface CategoriesOverviewStatsProps {
  data: CategoryOverviewData;
}

export const CategoriesOverviewStats: React.FC<CategoriesOverviewStatsProps> = ({ data }) => {
  const { summary } = data;
  const subRatio = summary.total ? Math.round((summary.subCount / summary.total) * 100) : 0;
  const seoRatio = summary.total ? Math.round((summary.withSeo / summary.total) * 100) : 0;

  const tiles = [
    {
      label: 'Total Categories',
      value: summary.total,
      context: `${summary.active} active · ${summary.inactive} inactive`,
      icon: <FcFolder className="w-8 h-8" />,
      to: '/categories',
    },
    {
      label: 'Root Departments',
      value: summary.rootCount,
      context: 'Top-level department groups',
      icon: <FcWorkflow className="w-8 h-8" />,
      to: '/categories',
    },
    {
      label: 'Subcategories',
      value: summary.subCount,
      context: `${subRatio}% of catalog taxonomy`,
      icon: <FcTreeStructure className="w-8 h-8" />,
      to: '/categories',
    },
    {
      label: 'Featured Collections',
      value: summary.featuredCount,
      context: 'Highlighted on storefront banner strips',
      icon: <FcRating className="w-8 h-8" />,
      to: '/categories',
    },
    {
      label: 'Mega-Menu Visible',
      value: summary.menuCount,
      context: 'Live in storefront header navigation',
      icon: <FcMenu className="w-8 h-8" />,
      to: '/categories',
    },
    {
      label: 'SEO & Rich Media',
      value: `${seoRatio}%`,
      context: `${summary.withSeo} SEO · ${summary.withBanners} banners`,
      icon: <FcCheckmark className="w-8 h-8" />,
      to: '/categories',
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
            <div className="text-2xl font-bold text-slate-900 tracking-tight">
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

export default CategoriesOverviewStats;
