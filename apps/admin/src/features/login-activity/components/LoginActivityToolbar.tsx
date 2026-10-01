import React from 'react';
import { CalendarRange, RefreshCw } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import Button from '@shared/ui/Button';
import Tabs from '@shared/ui/Tabs';
import type { LoginActivityState, LoginRange, LoginStatusTab } from '../hooks/useLoginActivity';

const STATUS_TABS: { key: LoginStatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'SUCCESS', label: 'Successful' },
  { key: 'FAILED', label: 'Failed' },
  { key: 'BLOCKED', label: 'Blocked' },
  { key: 'LOGOUT', label: 'Sign-outs' },
];

const RANGE_OPTIONS: { value: LoginRange; label: string }[] = [
  { value: 'today', label: 'Today' },
  { value: '7d', label: 'Last 7 days' },
  { value: '30d', label: 'Last 30 days' },
];

/** Status tabs, then period chip on the left and search + refresh on the right. */
export const LoginActivityToolbar: React.FC<{ state: LoginActivityState }> = ({ state }) => (
  <>
    <Tabs className="mb-3" items={STATUS_TABS} value={state.status} onChange={state.setStatus} />

    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Period"
          icon={<CalendarRange className="h-3.5 w-3.5" />}
          value={state.filters.range}
          onChange={state.setRange}
          options={RANGE_OPTIONS}
        />
        {state.hasFilters && (
          <button type="button" onClick={state.clearFilters} className="px-1 text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Clear all
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SearchInput
          value={state.filters.q}
          onChange={state.setQuery}
          placeholder="Search email, IP, device…"
          className="w-64"
        />
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className={state.isLoading ? 'animate-spin' : undefined} />}
          onClick={state.reload}
          disabled={state.isLoading}
        >
          Refresh
        </Button>
      </div>
    </div>
  </>
);

export default LoginActivityToolbar;
