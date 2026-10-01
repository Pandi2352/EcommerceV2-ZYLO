import React from 'react';
import type { Role } from '../../../services/roles.service';
import type { GroupedPermissionDomain } from '../../../services/permissions.service';
import { formatDateTime } from '@shared/utils/format';
import { groupKeys } from '../lib/permissionCatalog';
import { hasAllPermissions } from '../lib/roleRules';

export interface RoleOverviewTabProps {
  role: Role;
  catalog: GroupedPermissionDomain[];
  onOpenPermissions: () => void;
}

const Row: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="grid grid-cols-[8rem_1fr] gap-3 py-2 text-[13px]">
    <dt className="text-zinc-500">{label}</dt>
    <dd className="min-w-0 text-zinc-800">{children}</dd>
  </div>
);

/** Role facts plus how much of each permission group the saved role covers. */
export const RoleOverviewTab: React.FC<RoleOverviewTabProps> = ({ role, catalog, onOpenPermissions }) => {
  const saved = new Set(role.permissions);
  const all = hasAllPermissions(role);

  return (
    <div className="grid gap-3 lg:grid-cols-2">
      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-1 text-sm font-semibold text-zinc-900">Details</h2>
        <dl className="divide-y divide-zinc-100">
          <Row label="Description">{role.description || <span className="text-zinc-400">No description</span>}</Row>
          <Row label="Key"><code className="font-mono text-xs">{role.key}</code></Row>
          <Row label="Type">{role.isSystem ? 'System role (built in)' : 'Custom role'}</Row>
          <Row label="Created"><span className="tabular-nums">{formatDateTime(role.createdAt)}</span></Row>
          <Row label="Last updated"><span className="tabular-nums">{formatDateTime(role.updatedAt ?? role.createdAt)}</span></Row>
        </dl>
      </section>

      <section className="rounded-lg border border-zinc-200 bg-white p-4">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-zinc-900">Access by area</h2>
          <button type="button" onClick={onOpenPermissions} className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
            Open permissions
          </button>
        </div>
        {catalog.length === 0 ? (
          <p className="py-2 text-[13px] text-zinc-500">The permission catalog couldn't be loaded.</p>
        ) : (
          <ul className="divide-y divide-zinc-100">
            {catalog.map((group) => {
              const keys = groupKeys(group);
              const granted = all ? keys.length : keys.filter((k) => saved.has(k)).length;
              const pct = keys.length ? Math.round((granted / keys.length) * 100) : 0;
              return (
                <li key={group.group} className="flex items-center gap-3 py-2 text-[13px]">
                  <span className="w-36 shrink-0 truncate text-zinc-700">{group.group}</span>
                  <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-zinc-100" aria-hidden="true">
                    <span className="block h-full rounded-full bg-zinc-800" style={{ width: `${pct}%` }} />
                  </span>
                  <span className="w-14 shrink-0 text-right text-xs tabular-nums text-zinc-500">
                    {granted}/{keys.length}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
};

export default RoleOverviewTab;
