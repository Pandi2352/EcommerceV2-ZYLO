import React, { useState, useEffect } from 'react';
import { X, Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { USER_ROLES, type UserRole } from '@shared/constants/roles';
import {
  SYSTEM_PERMISSIONS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  ROLE_DEFAULT_PERMISSIONS,
} from '@shared/constants/permissions';
import SelectField from '@shared/ui/SelectField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { staffService, type StaffUser } from '../../services/staff.service';

export interface EditStaffModalProps {
  user: StaffUser | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdated?: (updated: StaffUser) => void;
}

const ROLE_OPTIONS = [
  { value: USER_ROLES.SUPPORT_AGENT, label: 'Support Agent (Read catalog & customer support)' },
  { value: USER_ROLES.MANAGER, label: 'Store Manager (Fulfill orders & manage products)' },
  { value: USER_ROLES.ADMIN, label: 'Administrator (Operations & staff management)' },
  { value: USER_ROLES.SUPER_ADMIN, label: 'Super Administrator (Full platform ownership)' },
];

export const EditStaffModal: React.FC<EditStaffModalProps> = ({
  user,
  isOpen,
  onClose,
  onUpdated,
}) => {
  const [role, setRole] = useState<UserRole>(USER_ROLES.ADMIN);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [isActive, setIsActive] = useState(true);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setRole(user.role);
      setIsActive(user.isActive);
      if (user.customPermissions && user.customPermissions.length > 0) {
        setUseCustomPermissions(true);
        setSelectedPermissions(user.customPermissions);
      } else {
        setUseCustomPermissions(false);
        setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[user.role] || []);
      }
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleTogglePermission = (permId: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(permId) ? prev.filter((p) => p !== permId) : [...prev, permId],
    );
  };

  const handleSelectAllInModule = (module: string) => {
    const modulePerms = SYSTEM_PERMISSIONS.filter((p) => p.module === module).map((p) => p.id);
    const allSelected = modulePerms.every((p) => selectedPermissions.includes(p));
    if (allSelected) {
      setSelectedPermissions((prev) => prev.filter((p) => !modulePerms.includes(p)));
    } else {
      setSelectedPermissions((prev) => Array.from(new Set([...prev, ...modulePerms])));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      let updatedUser = user;

      // 1. Update role if changed
      if (role !== user.role) {
        updatedUser = await staffService.updateRole(user.id, role);
      }

      // 2. Update permissions
      const permsToSave = useCustomPermissions ? selectedPermissions : [];
      updatedUser = await staffService.updatePermissions(user.id, permsToSave);

      // 3. Update status if changed
      if (isActive !== user.isActive) {
        updatedUser = await staffService.updateStatus(user.id, isActive);
      }

      toast.success(`Updated settings for ${user.name}`);
      onUpdated?.(updatedUser);
      onClose();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to update user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-indigo-500/10 text-indigo-600 flex items-center justify-center">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Edit Staff Permissions & Role</h3>
              <p className="text-xs text-slate-500">
                {user.name} ({user.email})
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          <SelectField
            label="Assigned Role"
            options={ROLE_OPTIONS}
            value={role}
            onChange={(e) => {
              const newRole = e.target.value as UserRole;
              setRole(newRole);
              if (!useCustomPermissions) {
                setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[newRole] || []);
              }
            }}
          />

          {/* Account Status Switch */}
          <div className="flex items-center justify-between p-3 rounded-md bg-slate-50 border border-slate-200">
            <div>
              <p className="font-semibold text-slate-800">Account Active</p>
              <p className="text-[11px] text-slate-400">
                Suspended accounts cannot sign in to the administration console.
              </p>
            </div>
            <input
              type="checkbox"
              name="accountActive"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#299cdb] focus:ring-[#299cdb] cursor-pointer"
            />
          </div>

          {/* Custom Permissions Toggle */}
          <div className="pt-1 border-t border-slate-100">
            <div className="flex items-center justify-between py-1">
              <div>
                <p className="font-semibold text-slate-700">Custom Granular Permissions</p>
                <p className="text-[11px] text-slate-400">
                  Override standard role permissions for this user specifically.
                </p>
              </div>
              <input
                type="checkbox"
                name="customPerms"
                checked={useCustomPermissions}
                onChange={(e) => {
                  const checked = e.target.checked;
                  setUseCustomPermissions(checked);
                  if (!checked) {
                    setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[role] || []);
                  }
                }}
                className="w-4 h-4 rounded border-slate-300 text-[#299cdb] focus:ring-[#299cdb] cursor-pointer"
              />
            </div>

            {useCustomPermissions && (
              <div className="mt-3 space-y-2 border border-slate-200 rounded-md p-2.5 bg-slate-50/50">
                <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 uppercase px-1 pb-1">
                  <span>Permissions ({selectedPermissions.length} selected)</span>
                </div>

                {PERMISSION_MODULES.map((mod) => {
                  const perms = SYSTEM_PERMISSIONS.filter((p) => p.module === mod);
                  const isExpanded = expandedModule === mod;
                  const selectedCount = perms.filter((p) => selectedPermissions.includes(p.id)).length;

                  return (
                    <div key={mod} className="border border-slate-200/80 rounded bg-white overflow-hidden">
                      <button
                        type="button"
                        onClick={() => setExpandedModule(isExpanded ? null : mod)}
                        className="w-full flex items-center justify-between px-3 py-2 text-left hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        <span className="font-semibold text-slate-700">
                          {PERMISSION_MODULE_LABELS[mod]}
                        </span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                            {selectedCount}/{perms.length}
                          </span>
                          {isExpanded ? (
                            <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                          )}
                        </div>
                      </button>

                      {isExpanded && (
                        <div className="p-3 bg-slate-50/40 border-t border-slate-100 space-y-2">
                          <div className="flex justify-end pb-1">
                            <button
                              type="button"
                              onClick={() => handleSelectAllInModule(mod)}
                              className="text-[10px] font-bold text-[#299cdb] hover:underline cursor-pointer"
                            >
                              {selectedCount === perms.length ? 'Deselect All' : 'Select All'}
                            </button>
                          </div>
                          <div className="grid grid-cols-1 gap-1.5">
                            {perms.map((perm) => (
                              <label
                                key={perm.id}
                                className="flex items-start gap-2 p-1.5 rounded hover:bg-white transition-colors cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedPermissions.includes(perm.id)}
                                  onChange={() => handleTogglePermission(perm.id)}
                                  className="rounded border-slate-300 text-[#299cdb] focus:ring-[#299cdb] mt-0.5"
                                />
                                <div>
                                  <p className="font-medium text-slate-800 leading-tight">
                                    {perm.label}
                                  </p>
                                  <p className="text-[10px] text-slate-400 leading-tight mt-0.5">
                                    {perm.description}
                                  </p>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={onClose} className="py-2 text-xs">
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              className="py-2 text-xs"
            >
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditStaffModal;
