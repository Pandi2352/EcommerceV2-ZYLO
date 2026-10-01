import React, { useState, useEffect } from 'react';
import { Shield, AlertTriangle, Check, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { staffUsersService, type StaffUserItem, type StaffUserDetail } from '../../services/staffUsers.service';
import { rolesService, type Role } from '../../services/roles.service';
import { extractErrorMessage } from '@shared/api/client';

export interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUserItem | StaffUserDetail | null;
  onSuccess: () => void;
}

export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [roles, setRoles] = useState<Role[]>([]);
  const [selectedRoleId, setSelectedRoleId] = useState<string>('');
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen && user) {
      setIsLoadingRoles(true);
      rolesService
        .listRoles()
        .then((res) => {
          const activeRoles = res.items.filter((r) => r.status === 'ACTIVE');
          setRoles(activeRoles);
          const currentId = user.roleIds?.[0] || '';
          setSelectedRoleId(currentId);
        })
        .catch((err) => {
          toast.error(extractErrorMessage(err));
        })
        .finally(() => {
          setIsLoadingRoles(false);
        });
    }
  }, [isOpen, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedRoleId) return;

    if (user.roleIds?.[0] === selectedRoleId) {
      onClose();
      return;
    }

    try {
      setIsSubmitting(true);
      await staffUsersService.assignRoles(user.id, [selectedRoleId]);
      toast.success(`Role updated successfully for ${user.email}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !user) return null;

  const targetRole = roles.find((r) => r.id === selectedRoleId);
  const isSuperAdminTarget = targetRole?.key === 'super_admin';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" aria-modal="true" role="dialog">
      <div className="flex min-h-full items-center justify-center p-4 text-center sm:p-0">
        <div
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-200"
          onClick={() => !isSubmitting && onClose()}
        />

        <div className="relative transform overflow-hidden rounded-2xl bg-white text-left shadow-2xl transition-all sm:my-8 sm:w-full sm:max-w-lg border border-slate-200/80">
          <form onSubmit={handleSubmit}>
            <div className="bg-white px-6 pt-6 pb-5">
              <div className="flex items-start justify-between pb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Shield className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Change Role Assignment</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      {user.name} ({user.userCode})
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSubmitting}
                  className="text-slate-400 hover:text-slate-500 p-1 -mr-1"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">
                    Select New Role
                  </label>
                  {isLoadingRoles ? (
                    <div className="h-10 bg-slate-100 animate-pulse rounded-lg" />
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                      {roles.map((r) => {
                        const isSelected = r.id === selectedRoleId;
                        const isCurrent = user.roleIds?.includes(r.id);

                        return (
                          <div
                            key={r.id}
                            onClick={() => setSelectedRoleId(r.id)}
                            className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                              isSelected
                                ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                                : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/60'
                            }`}
                          >
                            <div className="flex-1 pr-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-slate-900">{r.name}</span>
                                {r.isSystem && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-200 text-slate-700">
                                    System
                                  </span>
                                )}
                                {isCurrent && (
                                  <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                                    Current
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">
                                {r.description || `${r.permissions.length} granular permissions`}
                              </p>
                            </div>
                            <div
                              className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                                isSelected
                                  ? 'border-indigo-600 bg-indigo-600 text-white'
                                  : 'border-slate-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5" />}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {isSuperAdminTarget && (
                  <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold">Privilege Escalation Warning:</span> Assigning the Super Administrator role grants unrestricted root authority across all modules, sensitive settings, and financial records.
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-slate-50 px-6 py-3.5 flex items-center justify-end gap-3 border-t border-slate-100">
              <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleSubmit}
                isLoading={isSubmitting}
                disabled={!selectedRoleId || selectedRoleId === user.roleIds?.[0]}
              >
                Apply Role Change
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChangeRoleDialog;
