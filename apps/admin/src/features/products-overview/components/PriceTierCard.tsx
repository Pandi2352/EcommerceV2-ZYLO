import React from 'react';
import ChartCard from '@shared/charts/ChartCard';
import StackedBar from '@shared/charts/StackedBar';
import type { ProductOverviewData } from '@shared/types/product';

interface PriceTierCardProps {
  data: ProductOverviewData;
}

export const PriceTierCard: React.FC<PriceTierCardProps> = ({ data }) => {
  const { priceTierBreakdown, summary } = data;

  const segments = priceTierBreakdown.map((s) => ({
    key: s.key,
    label: s.label,
    value: s.value,
    color: s.color,
  }));

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Pricing Tier & Market Segmentation"
      subtitle={`Average item list price $${summary.averagePrice.toFixed(2)} with diverse consumer brackets`}
    >
      <StackedBar
        segments={segments}
        ariaLabel="Product pricing bracket segmentation breakdown"
      />
    </ChartCard>
  );
};

export default PriceTierCard;
