import React from 'react';
import { FcShop, FcApproval, FcRating, FcGlobe } from 'react-icons/fc';
import type { BrandStats } from '@shared/types/brand';

export interface BrandMetricsCardsProps {
  stats: BrandStats | null;
  isLoading?: boolean;
}

export const BrandMetricsCards: React.FC<BrandMetricsCardsProps> = ({ stats, isLoading }) => {
  const cards = [
    {
      title: 'Total Brands',
      value: stats?.total ?? 0,
      subtext: `${stats?.active ?? 0} active in catalog`,
      icon: <FcShop className="w-8 h-8" />,
    },
    {
      title: 'Active Partners',
      value: stats?.active ?? 0,
      subtext: 'Live on storefront catalog',
      icon: <FcApproval className="w-8 h-8" />,
    },
    {
      title: 'Featured Brands',
      value: stats?.featured ?? 0,
      subtext: 'Spotlighted on homepage',
      icon: <FcRating className="w-8 h-8" />,
    },
    {
      title: 'Countries Represented',
      value: stats?.countriesCount ?? 0,
      subtext: 'Global manufacturing hubs',
      icon: <FcGlobe className="w-8 h-8" />,
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
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
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

export default BrandMetricsCards;
