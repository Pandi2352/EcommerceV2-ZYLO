import React from 'react';
import { FcPackage, FcApproval, FcHighPriority, FcSalesPerformance } from 'react-icons/fc';
import type { ProductMetrics } from '@shared/types/product';
import KpiMetricsGrid from '@shared/ui/KpiMetricsGrid';

export interface ProductMetricsCardsProps {
  metrics: ProductMetrics | null;
  isLoading?: boolean;
}

export const ProductMetricsCards: React.FC<ProductMetricsCardsProps> = ({ metrics, isLoading }) => {
  const cards = [
    {
      title: 'Total Catalog Products',
      value: metrics?.totalProducts ?? 0,
      subtext: `${metrics?.publishedProducts ?? 0} published items`,
      icon: <FcPackage className="w-8 h-8" />,
    },
    {
      title: 'Published & Live',
      value: metrics?.publishedProducts ?? 0,
      subtext: `${metrics?.draftProducts ?? 0} draft items pending`,
      icon: <FcApproval className="w-8 h-8" />,
    },
    {
      title: 'Low Stock Alerts',
      value: metrics?.lowStockProducts ?? 0,
      subtext: `${metrics?.outOfStockProducts ?? 0} items out of stock`,
      icon: <FcHighPriority className="w-8 h-8" />,
    },
    {
      title: 'Brands Represented',
      value: metrics?.uniqueBrandsCount ?? 0,
      subtext: `${metrics?.featuredProducts ?? 0} featured spotlights`,
      icon: <FcSalesPerformance className="w-8 h-8" />,
    },
  ];

  return <KpiMetricsGrid cards={cards} isLoading={isLoading} />;
};

export default ProductMetricsCards;
