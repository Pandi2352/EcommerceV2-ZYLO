import React from 'react';
import { CircleDot } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import type { RolesListState } from '../hooks/useRolesList';
import { pluralize } from '../lib/roleRules';

/** Status chip on the left; search on the right. */
export const RolesToolbar: React.FC<{ state: RolesListState }> = ({ state }) => {
  const { filters, counts } = state;
  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', description: pluralize(counts.active, 'role') },
    { value: 'INACTIVE', label: 'Inactive', description: pluralize(counts.inactive, 'role') },
  ];

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Status"
          icon={<CircleDot className="h-3.5 w-3.5" />}
          value={filters.status}
          onChange={(v) => state.setFilter('status', v)}
          options={statusOptions}
        />
        {state.hasFilters && (
          <button type="button" onClick={state.clearFilters} className="px-1 text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Clear all
          </button>
        )}
      </div>

      <SearchInput
        value={filters.q}
        onChange={(v) => state.setFilter('q', v)}
        placeholder="Search name, key, description…"
        className="w-64"
      />
    </div>
  );
};

export default RolesToolbar;
