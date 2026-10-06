import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import BarList from '@shared/charts/BarList';
import type { ProductOverviewData } from '@shared/types/product';

interface BrandProductDistributionCardProps {
  data: ProductOverviewData;
}

/** Shows which brands have the highest catalog representation */
export const BrandProductDistributionCard: React.FC<BrandProductDistributionCardProps> = ({ data }) => {
  const brands = data.brandDistribution;

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Top Brand Partners by SKU Share"
      subtitle={`${brands.length} manufacturer brands powering active catalog items`}
      table={
        <ChartTable
          columns={['Brand Partner', 'SKU Count', 'Share']}
          rows={brands.map((b) => [b.name, b.count, `${b.percentage}%`])}
        />
      }
    >
      <BarList
        items={brands.map((b) => ({
          key: b.id,
          label: b.name,
          value: b.count,
          to: `/products?brandId=${b.id}`,
          note: `${b.percentage}% share`,
        }))}
        emptyText="No brand partner distribution data found."
      />
    </ChartCard>
  );
};

export default BrandProductDistributionCard;
