import React from 'react';
import { FcShop, FcApproval, FcRating, FcGlobe } from 'react-icons/fc';
import type { BrandStats } from '@shared/types/brand';
import KpiMetricsGrid from '@shared/ui/KpiMetricsGrid';

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

  return <KpiMetricsGrid cards={cards} isLoading={isLoading} />;
};

export default BrandMetricsCards;
