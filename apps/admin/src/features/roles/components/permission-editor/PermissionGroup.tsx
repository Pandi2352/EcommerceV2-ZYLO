import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { GroupedPermissionDomain } from '../../../../services/permissions.service';
import type { PermissionDraft } from '../../hooks/usePermissionDraft';
import { groupKeys } from '../../lib/permissionCatalog';
import PermissionModule from './PermissionModule';

export interface PermissionGroupProps {
  group: GroupedPermissionDomain;
  draft: PermissionDraft;
  expanded: boolean;
  onToggle: () => void;
  isModuleExpanded: (moduleId: string) => boolean;
  onToggleModule: (moduleId: string) => void;
  readOnlyReason?: string;
}

/** Collapsible group card (e.g. "Catalog") with Select all / Clear and its modules. */
export const PermissionGroup: React.FC<PermissionGroupProps> = ({
  group,
  draft,
  expanded,
  onToggle,
  isModuleExpanded,
  onToggleModule,
  readOnlyReason,
}) => {
  const keys = groupKeys(group);
  const selected = keys.filter(draft.has).length;

  return (
    <section className="overflow-hidden rounded-lg border border-zinc-200 bg-white">
      <div className={cn('flex items-center gap-2 px-3 py-2', expanded && 'border-b border-zinc-100 bg-zinc-50/60')}>
        <button
          type="button"
          onClick={onToggle}
          aria-expanded={expanded}
          className="flex min-w-0 flex-1 items-center gap-2 text-left outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/10"
        >
          <ChevronRight className={cn('h-3.5 w-3.5 shrink-0 text-zinc-400 transition-transform', expanded && 'rotate-90')} />
          <h3 className="truncate text-sm font-semibold text-zinc-900">{group.group}</h3>
          <span className="text-xs tabular-nums text-zinc-500">
            {selected}/{keys.length}
          </span>
        </button>
        {!readOnlyReason && (
          <div className="flex shrink-0 items-center gap-0.5">
            <button
              type="button"
              onClick={() => draft.setMany(keys, true)}
              disabled={selected === keys.length}
              className="rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Select all
            </button>
            <button
              type="button"
              onClick={() => draft.setMany(keys, false)}
              disabled={selected === 0}
              className="rounded px-1.5 py-0.5 text-xs text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 disabled:cursor-not-allowed disabled:opacity-40"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {expanded &&
        group.modules.map((mod) => (
          <PermissionModule
            key={mod.module}
            mod={mod}
            draft={draft}
            expanded={isModuleExpanded(`${group.group}/${mod.module}`)}
            onToggleExpanded={() => onToggleModule(`${group.group}/${mod.module}`)}
            readOnlyReason={readOnlyReason}
          />
        ))}
    </section>
  );
};

export default PermissionGroup;
