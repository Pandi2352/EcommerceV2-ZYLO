import React from 'react';
import { CircleDot, Download, UserCog } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import Button from '@shared/ui/Button';
import type { StaffUsersState } from '../hooks/useStaffUsers';
import { useRoleOptions } from '../../roles/hooks/useRoleOptions';

export interface UsersToolbarProps {
  state: StaffUsersState;
  selectedCount: number;
  onExport: () => void;
}

/** Filter chips on the left; search and export on the right. */
export const UsersToolbar: React.FC<UsersToolbarProps> = ({ state, selectedCount, onExport }) => {
  const { options: roleOptions } = useRoleOptions();
  const { filters, stats } = state;

  const statusOptions = [
    { value: 'ACTIVE', label: 'Active', description: stats ? `${stats.activeCount} users` : undefined },
    { value: 'INACTIVE', label: 'Inactive', description: stats ? `${stats.inactiveCount} users` : undefined },
  ];

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

      <div className="flex items-center gap-2">
        <SearchInput
          value={filters.q}
          onChange={(v) => state.setFilter('q', v)}
          placeholder="Search name, email, user ID…"
          className="w-64"
        />
        <Button size="sm" variant="outline" leftIcon={<Download />} onClick={onExport} disabled={!state.users?.length}>
          {selectedCount > 0 ? `Export ${selectedCount}` : 'Export'}
        </Button>
      </div>
    </div>
  );
};

export default UsersToolbar;
