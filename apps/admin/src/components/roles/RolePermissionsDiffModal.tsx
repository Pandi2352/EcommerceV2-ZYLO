import React, { useState } from 'react';
import { ShieldCheck, Plus, Minus, X } from 'lucide-react';
import Button from '@shared/ui/Button';

export interface RolePermissionsDiffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => Promise<void>;
  addedPermissions: string[];
  removedPermissions: string[];
  roleName: string;
  isLoading: boolean;
}

export const RolePermissionsDiffModal: React.FC<RolePermissionsDiffModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  addedPermissions,
  removedPermissions,
  roleName,
  isLoading,
}) => {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  const totalChanges = addedPermissions.length + removedPermissions.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(reason);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => !isLoading && onClose()}
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-xl border border-slate-200/80">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Review Permission Changes</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Updating access rules for <strong>{roleName}</strong> ({totalChanges} modifications)
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isLoading}
                  className="text-slate-400 hover:text-slate-500 p-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                {/* Added Permissions */}
                {addedPermissions.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-emerald-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      Granting Permissions (+{addedPermissions.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-emerald-50/60 border border-emerald-100">
                      {addedPermissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-100/80 text-emerald-800 font-mono text-[11px] font-semibold"
                        >
                          <Plus className="w-3 h-3 text-emerald-600" />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Removed Permissions */}
                {removedPermissions.length > 0 && (
                  <div>
                    <div className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500" />
                      Revoking Permissions (-{removedPermissions.length})
                    </div>
                    <div className="flex flex-wrap gap-1.5 p-3 rounded-xl bg-rose-50/60 border border-rose-100">
                      {removedPermissions.map((perm) => (
                        <span
                          key={perm}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-rose-100/80 text-rose-800 font-mono text-[11px] font-semibold"
                        >
                          <Minus className="w-3 h-3 text-rose-600" />
                          {perm}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Change Reason for Audit Log */}
                <div className="pt-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Reason for Change (Recorded in Audit Trail)
                  </label>
                  <input
                    type="text"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. Added customer refund authorization per management policy"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  />
                </div>
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={onClose} disabled={isLoading}>
                Cancel
              </Button>
              <Button variant="primary" type="submit" isLoading={isLoading}>
                Confirm & Apply Permissions
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RolePermissionsDiffModal;
