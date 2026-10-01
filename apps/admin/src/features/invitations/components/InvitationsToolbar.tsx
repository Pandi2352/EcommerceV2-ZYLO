import React from 'react';
import { RefreshCw, UserCog } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import Button from '@shared/ui/Button';
import { cn } from '@shared/utils/cn';
import type { InvitationsState } from '../hooks/useInvitations';
import { useRoleOptions } from '../../roles/hooks/useRoleOptions';

/** Role filter chip on the left; search and refresh on the right. */
export const InvitationsToolbar: React.FC<{ state: InvitationsState }> = ({ state }) => {
  const { options: roleOptions } = useRoleOptions();
  const { filters } = state;

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Role"
          icon={<UserCog className="h-3.5 w-3.5" />}
          value={filters.role}
          onChange={(v) => state.setFilter('role', v)}
          options={roleOptions}
          searchable={roleOptions.length > 7}
        />
        {state.hasFilters && (
          <button type="button" onClick={state.clearFilters} className="px-1 text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Clear all
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <SearchInput
          value={filters.q}
          onChange={(v) => state.setFilter('q', v)}
          placeholder="Search name, email, user ID…"
          className="w-64"
        />
        <Button
          size="sm"
          variant="outline"
          leftIcon={<RefreshCw className={cn(state.isLoading && 'animate-spin')} />}
          onClick={state.reload}
          disabled={state.isLoading}
        >
          Refresh
        </Button>
      </div>
    </div>
  );
};

export default InvitationsToolbar;
