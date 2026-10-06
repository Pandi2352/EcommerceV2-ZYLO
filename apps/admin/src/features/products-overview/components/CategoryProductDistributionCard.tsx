import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import BarList from '@shared/charts/BarList';
import type { ProductOverviewData } from '@shared/types/product';

interface CategoryProductDistributionCardProps {
  data: ProductOverviewData;
}

/** Shows which categories hold the most catalog products */
export const CategoryProductDistributionCard: React.FC<CategoryProductDistributionCardProps> = ({ data }) => {
  const categories = data.categoryDistribution;

  return (
    <ChartCard
      className="lg:col-span-2 rounded-md shadow-none border-slate-200"
      title="Which categories hold the most products?"
      subtitle={`${categories.length} department groups represented across ${data.summary.totalProducts} catalog products`}
      table={
        <ChartTable
          columns={['Department Category', 'Product Count', 'Share']}
          rows={categories.map((c) => [c.name, c.count, `${c.percentage}%`])}
        />
      }
    >
      <BarList
        items={categories.map((c) => ({
          key: c.id,
          label: c.name,
          value: c.count,
          to: `/products?categoryId=${c.id}`,
          note: `${c.percentage}% of catalog`,
        }))}
        emptyText="No category distribution data available."
      />
    </ChartCard>
  );
};

export default CategoryProductDistributionCard;
