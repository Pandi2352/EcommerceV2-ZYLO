import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Package } from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';
import { formatDateTime } from '@shared/utils/format';
import { useProductsOverview } from '../features/products-overview/hooks/useProductsOverview';
import ProductsOverviewStats from '../features/products-overview/components/ProductsOverviewStats';
import CategoryProductDistributionCard from '../features/products-overview/components/CategoryProductDistributionCard';
import BrandProductDistributionCard from '../features/products-overview/components/BrandProductDistributionCard';
import StockFulfillmentCard from '../features/products-overview/components/StockFulfillmentCard';
import PriceTierCard from '../features/products-overview/components/PriceTierCard';
import MerchandisingMixCard from '../features/products-overview/components/MerchandisingMixCard';
import RecentProductsCard from '../features/products-overview/components/RecentProductsCard';

const OverviewSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading products overview">
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="skeleton h-[92px] w-full rounded-md" />
      ))}
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="skeleton h-80 lg:col-span-2 rounded-md" />
      <div className="skeleton h-80 rounded-md" />
    </div>
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="skeleton h-72 rounded-md" />
      <div className="skeleton h-72 rounded-md" />
      <div className="skeleton h-72 rounded-md" />
    </div>
    <div className="skeleton h-64 rounded-md" />
  </div>
);

/**
 * Product Catalog Overview Page:
 * KPI metric cards, department allocations, brand SKU shares, warehouse stock health, and pricing tier analytics.
 */
export const ProductsOverviewPage: React.FC = () => {
  const { data, isLoading, error, reload } = useProductsOverview();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Product Catalog Overview"
        description="Comprehensive inventory valuations, department allocations, brand shares, and stock health at a glance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />}
              onClick={reload}
              className="rounded-md shadow-none"
            >
              Refresh
            </Button>
            <Link to="/products">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<Package className="w-4 h-4" />}
                className="rounded-md shadow-none"
              >
                All Products
              </Button>
            </Link>
          </div>
        }
      />

      {data && (
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <span>Catalog Inventory Health & Analytics</span>
          <span>Updated {formatDateTime(data.generatedAt)}</span>
        </div>
      )}

      {error && !data && (
        <Alert
          tone="error"
          title="Couldn't load the product catalog overview"
          action={
            <Button size="xs" variant="outline" onClick={reload}>
              Try again
            </Button>
          }
        >
          {error.message}
        </Alert>
      )}

      {!data && isLoading && <OverviewSkeleton />}

      {data && (
        <div className={`space-y-4 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
          {/* Top: 6 KPI Metric Tiles */}
          <ProductsOverviewStats data={data} />

          {/* Middle: Department Subcategory/Product Allocation & Brand Partner SKU Share */}
          <div className="grid gap-4 lg:grid-cols-3">
            <CategoryProductDistributionCard data={data} />
            <BrandProductDistributionCard data={data} />
          </div>

          {/* Secondary: Stock Health, Pricing Brackets, and Merchandising Exposure */}
          <div className="grid gap-4 lg:grid-cols-3">
            <StockFulfillmentCard data={data} />
            <PriceTierCard data={data} />
            <MerchandisingMixCard data={data} />
          </div>

          {/* Bottom: Recent Products Table */}
          <RecentProductsCard data={data} />
        </div>
      )}
    </div>
  );
};

export default ProductsOverviewPage;
