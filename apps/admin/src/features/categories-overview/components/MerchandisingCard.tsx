import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import StackedBar from '@shared/charts/StackedBar';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface MerchandisingCardProps {
  data: CategoryOverviewData;
}

/** Shows storefront visibility, mega menu inclusions, and promotional badges */
export const MerchandisingCard: React.FC<MerchandisingCardProps> = ({ data }) => {
  const { merchandising, summary } = data;

  const visibilitySegments = [
    {
      key: 'menu',
      label: 'Mega Menu',
      value: merchandising.inMenu,
      color: 'var(--viz-1)',
      to: '/categories',
    },
    {
      key: 'catalog-only',
      label: 'Catalog Only',
      value: merchandising.catalogOnly,
      color: 'var(--viz-3)',
      to: '/categories',
    },
  ];

  const featuredSegments = [
    {
      key: 'featured',
      label: 'Featured Collections',
      value: merchandising.featured,
      color: 'var(--viz-2)',
      to: '/categories',
    },
    {
      key: 'standard',
      label: 'Standard Categories',
      value: merchandising.standard,
      color: 'var(--viz-4)',
      to: '/categories',
    },
  ];

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Storefront Navigation & Merchandising"
      subtitle={`${merchandising.inMenu} categories in mega menu · ${merchandising.featured} marked as featured`}
      table={
        <ChartTable
          columns={['Aspect', 'Count', 'Coverage']}
          rows={[
            ['Mega Menu Visible', merchandising.inMenu, `${summary.total ? Math.round((merchandising.inMenu / summary.total) * 100) : 0}%`],
            ['Featured Collections', merchandising.featured, `${summary.total ? Math.round((merchandising.featured / summary.total) * 100) : 0}%`],
            ['Custom Badges', merchandising.withBadges, `${summary.total ? Math.round((merchandising.withBadges / summary.total) * 100) : 0}%`],
          ]}
        />
      }
    >
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Navigation Exposure</span>
            <span>{merchandising.inMenu} of {summary.total}</span>
          </div>
          <StackedBar
            segments={visibilitySegments}
            ariaLabel="Navigation visibility distribution"
          />
        </div>

        <div>
          <div className="flex items-center justify-between text-xs text-slate-500 mb-1.5 font-medium">
            <span>Featured Curation</span>
            <span>{merchandising.featured} of {summary.total}</span>
          </div>
          <StackedBar
            segments={featuredSegments}
            ariaLabel="Featured curation distribution"
          />
        </div>
      </div>
    </ChartCard>
  );
};

export default MerchandisingCard;
