import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { cn } from '@shared/utils/cn';
import type { PermissionDefinition } from '../../../../services/permissions.service';
import TriStateCheckbox from './TriStateCheckbox';

export interface PermissionRowProps {
  permission: PermissionDefinition;
  checked: boolean;
  /** Why the box can't be ticked (read-only role, or a permission the actor lacks) */
  lockedReason?: string;
  /** Shown next to a `view` permission that other ticked actions depend on */
  impliedHint?: boolean;
  onToggle: () => void;
}

/** One permission: checkbox, name, sensitive marker, description and key. */
export const PermissionRow: React.FC<PermissionRowProps> = ({ permission: p, checked, lockedReason, impliedHint, onToggle }) => (
  <label
    title={lockedReason}
    className={cn(
      'flex items-start gap-2.5 rounded-md px-2 py-1.5 transition-colors',
      lockedReason ? 'cursor-not-allowed' : 'cursor-pointer hover:bg-zinc-50',
    )}
  >
    <TriStateCheckbox checked={checked} disabled={!!lockedReason} onChange={onToggle} label={p.name} className="mt-0.5" />
    <div className="grid min-w-0 flex-1 grid-cols-1 gap-x-4 sm:grid-cols-[minmax(10rem,14rem)_1fr]">
      <div className="flex min-w-0 items-center gap-1.5">
        <span className={cn('truncate text-[13px]', checked ? 'font-medium text-zinc-900' : 'text-zinc-700')}>{p.name}</span>
        {p.isSensitive && (
          <span className="inline-flex items-center gap-0.5 text-xs text-amber-700" title="Sensitive permission">
            <AlertTriangle className="h-3 w-3" />
            <span className="sr-only">Sensitive</span>
          </span>
        )}
      </div>
      <div className="flex min-w-0 items-center gap-2">
        <span className="truncate text-xs text-zinc-500" title={p.description}>
          {p.description}
        </span>
        {impliedHint && <span className="shrink-0 text-xs text-zinc-400">Required by other actions</span>}
        <span className="ml-auto hidden shrink-0 font-mono text-[11px] text-zinc-400 md:inline">{p.key}</span>
      </div>
    </div>
  </label>
);

export default PermissionRow;
