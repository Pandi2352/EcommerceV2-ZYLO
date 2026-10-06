import React from 'react';
import ChartCard from '@shared/charts/ChartCard';
import StackedBar from '@shared/charts/StackedBar';
import type { ProductOverviewData } from '@shared/types/product';

interface StockFulfillmentCardProps {
  data: ProductOverviewData;
}

export const StockFulfillmentCard: React.FC<StockFulfillmentCardProps> = ({ data }) => {
  const { stockStatusBreakdown, summary } = data;

  const segments = stockStatusBreakdown.map((s) => ({
    key: s.key,
    label: s.label,
    value: s.value,
    color: s.color,
    to:
      s.key === 'outOfStock'
        ? '/products?stockStatus=OUT_OF_STOCK'
        : s.key === 'lowStock'
        ? '/products?stockStatus=LOW_STOCK'
        : '/products?stockStatus=IN_STOCK',
  }));

  return (
    <ChartCard
      className="rounded-md shadow-none border-slate-200"
      title="Warehouse Stock & Fulfillment Health"
      subtitle={`${summary.totalStockUnits.toLocaleString()} physical units distributed across ${summary.totalProducts} catalog lines`}
    >
      <StackedBar
        segments={segments}
        ariaLabel="Warehouse inventory stock status breakdown"
      />
    </ChartCard>
  );
};

export default StockFulfillmentCard;
