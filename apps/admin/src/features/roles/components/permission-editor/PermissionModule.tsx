import React from 'react';
import { ChevronRight } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { ModulePermissions } from '../../../../services/permissions.service';
import type { PermissionDraft } from '../../hooks/usePermissionDraft';
import { humanizeModule, moduleKeys } from '../../lib/permissionCatalog';
import TriStateCheckbox from './TriStateCheckbox';
import PermissionRow from './PermissionRow';

export interface PermissionModuleProps {
  mod: ModulePermissions;
  draft: PermissionDraft;
  expanded: boolean;
  onToggleExpanded: () => void;
  readOnlyReason?: string;
}

const UNHELD = "You can't grant a permission you don't have";

/** Module row with a tri-state checkbox, "View only" shortcut and its permissions. */
export const PermissionModule: React.FC<PermissionModuleProps> = ({ mod, draft, expanded, onToggleExpanded, readOnlyReason }) => {
  const keys = moduleKeys(mod);
  const selected = keys.filter(draft.has).length;
  const all = selected === keys.length;
  const editable = !readOnlyReason;
  const viewKey = mod.permissions.find((p) => p.action === 'view')?.key;
  const othersSelected = mod.permissions.some((p) => p.action !== 'view' && draft.has(p.key));

  return (
    <div className="border-t border-zinc-100 first:border-t-0">
      <div className="flex items-center gap-2 px-3 py-1.5">
        <button
          type="button"
          onClick={onToggleExpanded}
          aria-expanded={expanded}
          aria-label={`${expanded ? 'Collapse' : 'Expand'} ${mod.module}`}
          className="rounded p-0.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
        >
          <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', expanded && 'rotate-90')} />
        </button>
        <TriStateCheckbox
          checked={all}
          indeterminate={selected > 0 && !all}
          disabled={!editable}
          title={readOnlyReason}
          onChange={() => draft.setMany(keys, !all)}
          label={`All ${mod.module} permissions`}
        />
        <button type="button" onClick={onToggleExpanded} className="text-[13px] font-medium text-zinc-800 hover:text-zinc-950">
          {humanizeModule(mod.module)}
        </button>
        <span className="text-xs tabular-nums text-zinc-400">
          {selected}/{keys.length}
        </span>
        {editable && viewKey && (
          <button
            type="button"
            onClick={() => draft.viewOnly(keys)}
            className="ml-auto rounded px-1.5 py-0.5 text-xs text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
          >
            View only
          </button>
        )}
      </div>

      {expanded && (
        <div className="pb-1.5 pl-9 pr-3">
          {mod.permissions.map((p) => {
            const checked = draft.has(p.key);
            const locked = readOnlyReason ?? (!checked && !draft.canGrant(p.key) ? UNHELD : undefined);
            return (
              <PermissionRow
                key={p.key}
                permission={p}
                checked={checked}
                lockedReason={locked}
                impliedHint={editable && p.key === viewKey && othersSelected}
                onToggle={() => draft.toggle(p.key)}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default PermissionModule;
