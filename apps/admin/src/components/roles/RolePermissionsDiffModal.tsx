import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { AlertTriangle, Minus, Plus, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import InputField from '@shared/ui/InputField';

export interface RolePermissionsDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  addedPermissions: string[];
  removedPermissions: string[];
  /** Changed keys that are marked sensitive in the catalog; listed separately */
  sensitivePermissions?: string[];
  roleName: string;
  /** Users who get the new permissions immediately */
  userCount?: number;
  isLoading: boolean;
}

const KeyList: React.FC<{ keys: string[]; sign: 'add' | 'remove'; sensitive: Set<string> }> = ({ keys, sign, sensitive }) => (
  <ul className="divide-y divide-zinc-100 rounded-md border border-zinc-200">
    {keys.map((key) => (
      <li key={key} className="flex items-center gap-2 px-2.5 py-1.5">
        {sign === 'add' ? <Plus className="h-3 w-3 shrink-0 text-emerald-600" /> : <Minus className="h-3 w-3 shrink-0 text-rose-600" />}
        <span className="truncate font-mono text-xs text-zinc-800">{key}</span>
        {sensitive.has(key) && (
          <span className="ml-auto inline-flex shrink-0 items-center gap-1 text-xs text-amber-700">
            <AlertTriangle className="h-3 w-3" />
            Sensitive
          </span>
        )}
      </li>
    ))}
  </ul>
);

/** Confirms a permission change: lists what is added / removed and records a reason for the audit log. */
export const RolePermissionsDiffModal: React.FC<RolePermissionsDiffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  addedPermissions,
  removedPermissions,
  sensitivePermissions = [],
  roleName,
  userCount,
  isLoading,
}) => {
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && !isLoading && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const sensitive = new Set(sensitivePermissions);
  const summary = [
    addedPermissions.length > 0 && `adding ${addedPermissions.length}`,
    removedPermissions.length > 0 && `removing ${removedPermissions.length}`,
  ]
    .filter(Boolean)
    .join(', ');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    void onConfirm(reason);
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="perm-diff-title">
      <div className="fixed inset-0 animate-fade-in bg-zinc-900/40" onClick={() => !isLoading && onClose()} />

      <form
        onSubmit={handleSubmit}
        className="relative flex max-h-[85vh] w-full max-w-lg animate-pop-in flex-col rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15"
      >
        <div className="flex items-start justify-between gap-4 border-b border-zinc-100 px-5 py-4">
          <div className="min-w-0">
            <h3 id="perm-diff-title" className="text-[15px] font-semibold text-zinc-900">
              Save permission changes?
            </h3>
            <p className="mt-0.5 text-[13px] text-zinc-500">
              <span className="font-medium text-zinc-700">{roleName}</span>: {summary || 'no changes'}.
              {userCount !== undefined && ` Takes effect immediately for ${userCount} user${userCount === 1 ? '' : 's'}.`}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4 custom-scrollbar">
          {sensitive.size > 0 && (
            <p className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[13px] text-amber-800">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              This change includes {sensitive.size} sensitive permission{sensitive.size === 1 ? '' : 's'}. Double-check before saving.
            </p>
          )}
          {addedPermissions.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[13px] font-medium text-zinc-800">Granting ({addedPermissions.length})</h4>
              <KeyList keys={addedPermissions} sign="add" sensitive={sensitive} />
            </div>
          )}
          {removedPermissions.length > 0 && (
            <div>
              <h4 className="mb-1.5 text-[13px] font-medium text-zinc-800">Revoking ({removedPermissions.length})</h4>
              <KeyList keys={removedPermissions} sign="remove" sensitive={sensitive} />
            </div>
          )}
          <InputField
            fieldSize="sm"
            label="Reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Added refund approval per finance policy"
            helperText="Optional. Recorded in the audit log."
          />
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">
          <Button size="sm" variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" isLoading={isLoading}>
            Save permissions
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default RolePermissionsDiffModal;
