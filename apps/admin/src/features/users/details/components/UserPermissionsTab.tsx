import React, { useMemo, useState } from 'react';
import { KeyRound, ShieldCheck } from 'lucide-react';
import EmptyState from '@shared/ui/EmptyState';
import SearchInput from '@shared/ui/SearchInput';
import Button from '@shared/ui/Button';
import type { PermissionGroup } from '../hooks/useUserDetails';

export interface UserPermissionsTabProps {
  groups: PermissionGroup[];
  count: number;
  hasWildcard: boolean;
}

/** Effective permissions resolved from the user's role(s), grouped by module. */
export const UserPermissionsTab: React.FC<UserPermissionsTabProps> = ({ groups, count, hasWildcard }) => {
  const [query, setQuery] = useState('');

  const visible = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups
      .map((g) => ({ ...g, actions: g.actions.filter((a) => `${g.module}.${a} ${g.label}`.toLowerCase().includes(q)) }))
      .filter((g) => g.actions.length > 0);
  }, [groups, query]);

  if (hasWildcard) {
    return (
      <section className="flex items-start gap-3 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-50 text-amber-700">
          <ShieldCheck className="h-4 w-4" />
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Full access</h2>
          <p className="mt-0.5 text-[13px] text-zinc-600">
            This user holds the Super Admin wildcard (<code className="font-mono text-xs">*</code>), which grants every
            permission in every module, including ones added later. Assign a different role to restrict access.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">
            Effective permissions <span className="ml-1 text-[13px] font-medium tabular-nums text-zinc-400">{count}</span>
          </h2>
          <p className="text-xs text-zinc-500">Resolved from the assigned role(s). Change the role to change access.</p>
        </div>
        {count > 0 && (
          <div className="w-full sm:w-56">
            <SearchInput value={query} onChange={setQuery} placeholder="Filter permissions…" />
          </div>
        )}
      </div>

      {count === 0 ? (
        <EmptyState
          icon={<KeyRound />}
          title="No permissions"
          description="The assigned role grants no permissions, so this user can sign in but can't open any module."
        />
      ) : visible.length === 0 ? (
        <EmptyState
          icon={<KeyRound />}
          title="No permissions match"
          description={`Nothing matches "${query.trim()}".`}
          action={<Button size="sm" variant="outline" onClick={() => setQuery('')}>Clear filter</Button>}
        />
      ) : (
        <dl className="divide-y divide-zinc-100">
          {visible.map((group) => (
            <div key={group.module} className="flex flex-col gap-1.5 px-4 py-2.5 sm:flex-row sm:items-start sm:gap-4">
              <dt className="flex w-40 shrink-0 items-baseline gap-1.5 pt-0.5 text-[13px] font-medium text-zinc-800">
                {group.label}
                <span className="text-xs font-normal tabular-nums text-zinc-400">{group.actions.length}</span>
              </dt>
              <dd className="flex flex-wrap gap-1">
                {group.actions.map((action) => (
                  <span
                    key={action}
                    title={`${group.module}.${action}`}
                    className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 font-mono text-[11px] text-zinc-700"
                  >
                    {action}
                  </span>
                ))}
              </dd>
            </div>
          ))}
        </dl>
      )}
    </section>
  );
};

export default UserPermissionsTab;
