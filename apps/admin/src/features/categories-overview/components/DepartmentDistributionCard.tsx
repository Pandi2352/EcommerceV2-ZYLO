import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import BarList from '@shared/charts/BarList';
import type { CategoryOverviewData } from '../../../services/categoriesOverview.service';

interface DepartmentDistributionCardProps {
  data: CategoryOverviewData;
}

/** Shows which root departments hold the most child subcategories */
export const DepartmentDistributionCard: React.FC<DepartmentDistributionCardProps> = ({ data }) => {
  const departments = data.departmentDistribution;

  return (
    <ChartCard
      className="lg:col-span-2 rounded-md shadow-none border-slate-200"
      title="Which root departments hold the most subcategories?"
      subtitle={`${data.summary.rootCount} root departments across ${data.summary.total} total catalog categories`}
      table={
        <ChartTable
          columns={['Department', 'Subcategories', 'Status']}
          rows={departments.map((d) => [d.name, d.childCount, d.status])}
        />
      }
    >
      <BarList
        items={departments.map((d) => ({
          key: d.id,
          label: d.name,
          value: d.childCount,
          to: `/categories?search=${encodeURIComponent(d.name)}`,
          note: d.status === 'ACTIVE' ? (d.isFeatured ? 'Featured' : undefined) : 'Inactive',
        }))}
        emptyText="No categories found."
      />
    </ChartCard>
  );
};

export default DepartmentDistributionCard;
