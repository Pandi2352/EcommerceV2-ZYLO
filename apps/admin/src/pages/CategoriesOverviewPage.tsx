import React from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, FolderTree } from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';
import { formatDateTime } from '@shared/utils/format';
import { useCategoriesOverview } from '../features/categories-overview/hooks/useCategoriesOverview';
import CategoriesOverviewStats from '../features/categories-overview/components/CategoriesOverviewStats';
import DepartmentDistributionCard from '../features/categories-overview/components/DepartmentDistributionCard';
import HierarchyDepthCard from '../features/categories-overview/components/HierarchyDepthCard';
import MerchandisingCard from '../features/categories-overview/components/MerchandisingCard';
import CategoryHealthCard from '../features/categories-overview/components/CategoryHealthCard';
import RecentCategoriesCard from '../features/categories-overview/components/RecentCategoriesCard';

const OverviewSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading categories overview">
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
  </div>
);

/**
 * Categories Overview Page:
 * Count cards, department distribution charts, hierarchy depth, storefront exposure, and catalog health.
 */
export const CategoriesOverviewPage: React.FC = () => {
  const { data, isLoading, error, reload } = useCategoriesOverview();

  return (
    <div className="space-y-4">
      <PageHeader
        title="Categories Overview"
        description="Department hierarchies, storefront visibility, and catalog taxonomy distribution at a glance."
        actions={
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              leftIcon={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />}
              onClick={reload}
            >
              Refresh
            </Button>
            <Link to="/categories">
              <Button
                size="sm"
                variant="primary"
                leftIcon={<FolderTree className="w-4 h-4" />}
              >
                Taxonomy & List
              </Button>
            </Link>
          </div>
        }
      />

      {data && (
        <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
          <span>Catalog Taxonomy Health & Analytics</span>
          <span>Updated {formatDateTime(data.generatedAt)}</span>
        </div>
      )}

      {error && !data && (
        <Alert
          tone="error"
          title="Couldn't load the categories overview"
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
          {/* Top: 6 Metric Tiles */}
          <CategoriesOverviewStats data={data} />

          {/* Middle: Department Subcategories Chart + Hierarchy Depth Breakdown */}
          <div className="grid gap-4 lg:grid-cols-3">
            <DepartmentDistributionCard data={data} />
            <HierarchyDepthCard data={data} />
          </div>

          {/* Bottom: Storefront Merchandising + Catalog Health + Recent Additions */}
          <div className="grid gap-4 lg:grid-cols-3">
            <MerchandisingCard data={data} />
            <CategoryHealthCard data={data} />
            <RecentCategoriesCard data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default CategoriesOverviewPage;
