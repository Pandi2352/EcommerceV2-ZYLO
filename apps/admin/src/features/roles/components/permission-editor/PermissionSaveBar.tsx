import React from 'react';
import { Save } from 'lucide-react';
import Button from '@shared/ui/Button';
import { pluralize } from '../../lib/roleRules';

export interface PermissionSaveBarProps {
  added: number;
  removed: number;
  onDiscard: () => void;
  onReview: () => void;
}

/** Sticky bar shown while the permission draft differs from what is saved. */
export const PermissionSaveBar: React.FC<PermissionSaveBarProps> = ({ added, removed, onDiscard, onReview }) => {
  const total = added + removed;
  return (
    <div className="sticky bottom-4 z-30 mt-3 flex justify-center">
      <div
        role="status"
        className="flex animate-pop-in items-center gap-4 rounded-lg border border-zinc-200 bg-white py-2 pl-3.5 pr-2 shadow-lg shadow-zinc-900/10"
      >
        <span className="flex items-center gap-2 text-[13px] text-zinc-700">
          <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          <span className="font-medium text-zinc-900">{pluralize(total, 'unsaved change')}</span>
          <span className="tabular-nums text-zinc-500">
            <span className="text-emerald-700">+{added}</span> <span className="text-rose-700">−{removed}</span>
          </span>
        </span>
        <div className="flex items-center gap-1.5">
          <Button size="sm" variant="ghost" onClick={onDiscard}>
            Discard changes
          </Button>
          <Button size="sm" variant="primary" leftIcon={<Save />} onClick={onReview}>
            Save permissions
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PermissionSaveBar;
