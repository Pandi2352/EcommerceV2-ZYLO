import React, { useState } from 'react';
import { AppWindow, Zap } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import FilterDropdown from '@shared/ui/FilterDropdown';
import { humanizeConstant } from '@shared/utils/format';
import { AUDIT_EVENTS } from '../../../services/audit.service';
import type { AuditLogsState } from '../hooks/useAuditLogs';

const EVENT_OPTIONS = AUDIT_EVENTS.map((event) => ({ value: event as string, label: humanizeConstant(event) }));
const PORTAL_OPTIONS = [
  { value: 'admin', label: 'Admin portal' },
  { value: 'customer', label: 'Storefront' },
];

// The API filters on an exact address, so partial input is held back until it is a full email
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Event and portal chips on the left; exact-email search on the right. */
export const AuditLogFilters: React.FC<{ state: AuditLogsState }> = ({ state }) => {
  const { filters } = state;
  const [incomplete, setIncomplete] = useState(false);

  const onEmail = (value: string) => {
    const trimmed = value.trim();
    const valid = trimmed === '' || EMAIL_PATTERN.test(trimmed);
    setIncomplete(!valid);
    if (valid) state.setFilter('email', trimmed.toLowerCase());
  };

  return (
    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div className="flex flex-wrap items-center gap-2">
        <FilterDropdown
          label="Event"
          icon={<Zap className="h-3.5 w-3.5" />}
          value={filters.event}
          onChange={(v) => state.setFilter('event', v)}
          options={EVENT_OPTIONS}
          searchable
        />
        <FilterDropdown
          label="Portal"
          icon={<AppWindow className="h-3.5 w-3.5" />}
          value={filters.portal}
          onChange={(v) => state.setFilter('portal', v)}
          options={PORTAL_OPTIONS}
        />
        {state.hasFilters && (
          <button
            type="button"
            onClick={() => {
              setIncomplete(false);
              state.clearFilters();
            }}
            className="px-1 text-xs font-medium text-zinc-500 hover:text-zinc-900"
          >
            Clear all
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        {incomplete && <span className="text-xs text-zinc-500">Enter the full email address</span>}
        <SearchInput
          value={filters.email}
          onChange={onEmail}
          placeholder="Filter by email address…"
          aria-label="Filter by exact email address"
          className="w-64"
          debounceMs={500}
        />
      </div>
    </div>
  );
};

export default AuditLogFilters;
