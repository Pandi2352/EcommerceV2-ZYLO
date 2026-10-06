import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import StackedBar from '@shared/charts/StackedBar';
import type { ProductOverviewData } from '@shared/types/product';

interface MerchandisingMixCardProps {
  data: ProductOverviewData;
}

export const MerchandisingMixCard: React.FC<MerchandisingMixCardProps> = ({ data }) => {
  const { merchandising, summary } = data;

  const featuredSegments = [
    {
      key: 'featured',
      label: 'Featured Spotlight',
      value: merchandising.featured,
      color: '#f59e0b',
      to: '/products?isFeatured=true',
    },
    {
      key: 'standard',
      label: 'Standard Catalog',
      value: merchandising.standard,
      color: '#94a3b8',
      to: '/products',
    },
  ];

  const arrivalSegments = [
    {
      key: 'new',
      label: 'New Arrival Ribbon',
      value: merchandising.newArrivals,
      color: '#10b981',
      to: '/products?isNewArrival=true',
    },
    {
      key: 'standard',
      label: 'Regular Items',
      value: merchandising.standardArrivals,
      color: '#cbd5e1',
      to: '/products',
    },
  ];

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Storefront Merchandising Exposure"
      subtitle={`${merchandising.featured} products spotlighted · ${merchandising.newArrivals} marked as new arrivals`}
      table={
        <ChartTable
          columns={['Merchandising Type', 'Count', 'Catalog Share']}
          rows={[
            [
              'Featured Showcases',
              merchandising.featured,
              `${summary.totalProducts ? Math.round((merchandising.featured / summary.totalProducts) * 100) : 0}%`,
            ],
            [
              'New Arrivals Ribbon',
              merchandising.newArrivals,
              `${summary.totalProducts ? Math.round((merchandising.newArrivals / summary.totalProducts) * 100) : 0}%`,
            ],
            [
              'Active Promo Discounts',
              merchandising.withDiscount,
              `${summary.totalProducts ? Math.round((merchandising.withDiscount / summary.totalProducts) * 100) : 0}%`,
            ],
            [
              'Configured SKU Variants',
              merchandising.withVariants,
              `${summary.totalProducts ? Math.round((merchandising.withVariants / summary.totalProducts) * 100) : 0}%`,
            ],
          ]}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            Featured Homepage Spotlight
          </p>
          <StackedBar segments={featuredSegments} ariaLabel="Featured spotlight ratio" />
        </div>

        <div>
          <p className="mb-1.5 text-xs font-semibold text-slate-700 uppercase tracking-wider">
            New Arrival Tagging
          </p>
          <StackedBar segments={arrivalSegments} ariaLabel="New arrival tagging ratio" />
        </div>
      </div>
    </ChartCard>
  );
};

export default MerchandisingMixCard;
