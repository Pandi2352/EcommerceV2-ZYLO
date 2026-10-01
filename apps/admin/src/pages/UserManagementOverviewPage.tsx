import React from 'react';
import { CalendarDays, RefreshCw } from 'lucide-react';
import PageHeader from '@shared/ui/PageHeader';
import FilterDropdown from '@shared/ui/FilterDropdown';
import Button from '@shared/ui/Button';
import Alert from '@shared/ui/Alert';
import { formatDateTime } from '@shared/utils/format';
import { PERIODS, useUserOverview } from '../features/user-overview/hooks/useUserOverview';
import OverviewStats from '../features/user-overview/components/OverviewStats';
import SignInsChart from '../features/user-overview/components/SignInsChart';
import { InvitationsCard, RoleDistributionCard } from '../features/user-overview/components/DistributionCards';
import AttentionCard from '../features/user-overview/components/AttentionCard';
import RecentChangesCard from '../features/user-overview/components/RecentChangesCard';

const OverviewSkeleton = () => (
  <div className="space-y-4" aria-busy="true" aria-label="Loading overview">
    <div className="skeleton h-[104px] w-full" />
    <div className="grid gap-4 lg:grid-cols-3">
      <div className="skeleton h-72 lg:col-span-2" />
      <div className="skeleton h-72" />
    </div>
  </div>
);

/** User management → Overview: counts, sign-in trend, distributions and items to act on. */
export const UserManagementOverviewPage: React.FC = () => {
  const { data, isLoading, error, reload, days, setDays } = useUserOverview();

  return (
    <div>
      <PageHeader
        title="User management overview"
        description="Team size, access security and recent activity at a glance."
        actions={
          <Button size="sm" variant="outline" leftIcon={<RefreshCw className={isLoading ? 'animate-spin' : undefined} />} onClick={reload}>
            Refresh
          </Button>
        }
      />

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Period"
          icon={<CalendarDays className="h-3.5 w-3.5" />}
          value={String(days)}
          onChange={setDays}
          options={PERIODS}
        />
        {data && <span className="text-xs text-zinc-400">Updated {formatDateTime(data.generatedAt)}</span>}
      </div>

      {error && !data && (
        <Alert tone="error" title="Couldn't load the overview" action={<Button size="xs" variant="outline" onClick={reload}>Try again</Button>}>
          {error.message}
        </Alert>
      )}

      {!data && isLoading && <OverviewSkeleton />}

      {data && (
        // Keep the previous render while a new period loads, slightly dimmed
        <div className={`space-y-4 transition-opacity ${isLoading ? 'opacity-60' : ''}`}>
          <OverviewStats data={data} />
          <div className="grid gap-4 lg:grid-cols-3">
            <SignInsChart data={data} />
            <InvitationsCard data={data} />
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            <RoleDistributionCard data={data} />
            <AttentionCard data={data} />
            <RecentChangesCard data={data} />
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementOverviewPage;
