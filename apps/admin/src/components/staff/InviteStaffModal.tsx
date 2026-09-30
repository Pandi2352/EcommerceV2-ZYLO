import React, { useState, useEffect } from 'react';
import { X, Mail, Shield, Check, Copy, ChevronDown, ChevronUp } from 'lucide-react';
import { USER_ROLES, type UserRole, ROLE_LABELS } from '@shared/constants/roles';
import {
  SYSTEM_PERMISSIONS,
  PERMISSION_MODULES,
  PERMISSION_MODULE_LABELS,
  ROLE_DEFAULT_PERMISSIONS,
} from '@shared/constants/permissions';
import InputField from '@shared/ui/InputField';
import SelectField from '@shared/ui/SelectField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { staffService, type InviteStaffResponse } from '../../services/staff.service';

export interface InviteStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInvited?: (response: InviteStaffResponse) => void;
}

const ROLE_OPTIONS = [
  { value: USER_ROLES.SUPPORT_AGENT, label: 'Support Agent (Read catalog & customer support)' },
  { value: USER_ROLES.MANAGER, label: 'Store Manager (Fulfill orders & manage products)' },
  { value: USER_ROLES.ADMIN, label: 'Administrator (Operations & staff management)' },
  { value: USER_ROLES.SUPER_ADMIN, label: 'Super Administrator (Full platform ownership)' },
];

export const InviteStaffModal: React.FC<InviteStaffModalProps> = ({
  isOpen,
  onClose,
  onInvited,
}) => {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>(USER_ROLES.ADMIN);
  const [useCustomPermissions, setUseCustomPermissions] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [inviteResult, setInviteResult] = useState<InviteStaffResponse | null>(null);
  const [copied, setCopied] = useState(false);

  // Sync permissions when role changes if not custom
  useEffect(() => {
    if (!useCustomPermissions) {
      setSelectedPermissions(ROLE_DEFAULT_PERMISSIONS[role] || []);
    }
  }, [role, useCustomPermissions]);

  if (!isOpen) return null;

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
    if (!email.trim()) {
      toast.error('Please enter a valid email address');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await staffService.inviteStaff({
        email: email.trim(),
        name: name.trim() || undefined,
        role,
        customPermissions: useCustomPermissions ? selectedPermissions : undefined,
      });

      setInviteResult(res);
      toast.success(`Invitation sent to ${email}`);
      onInvited?.(res);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || err?.message || 'Failed to send invitation');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopy = () => {
    if (!inviteResult?.inviteLink) return;
    navigator.clipboard.writeText(inviteResult.inviteLink);
    setCopied(true);
    toast.success('Invitation link copied to clipboard');
    setTimeout(() => setCopied(false), 2500);
  };

  const resetAndClose = () => {
    setEmail('');
    setName('');
    setRole(USER_ROLES.ADMIN);
    setUseCustomPermissions(false);
    setSelectedPermissions([]);
    setInviteResult(null);
    setCopied(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white w-full max-w-xl rounded-lg shadow-xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-md bg-[#299cdb]/10 text-[#299cdb] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-800">Invite New Administrator</h3>
              <p className="text-xs text-slate-500">
                Grant team access with customized roles and granular permissions.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={resetAndClose}
            className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4 text-xs">
          {inviteResult ? (
            /* Success State */
            <div className="space-y-4 py-2 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto border border-emerald-200">
                <Check className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">Invitation Dispatched!</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  An email invitation has been delivered to{' '}
                  <span className="font-semibold text-slate-700">{inviteResult.invitation.email}</span>{' '}
                  as a <span className="font-semibold text-slate-700">{ROLE_LABELS[inviteResult.invitation.role]}</span>.
                </p>
              </div>

              {/* Direct Link Copy Card */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-left space-y-2">
                <p className="text-[11px] font-semibold text-slate-600">
                  Direct Invitation Link (expires in 7 days):
                </p>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={inviteResult.inviteLink}
                    className="flex-1 bg-white border border-slate-200 rounded px-2.5 py-1.5 text-slate-700 text-xs font-mono select-all outline-none"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCopy}
                    leftIcon={copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    className="py-1.5 px-3 text-xs shrink-0"
                  >
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <Button variant="primary" onClick={resetAndClose} className="px-5 py-2 text-xs">
                  Done
                </Button>
              </div>
            </div>
          ) : (
            /* Input Form */
            <form onSubmit={handleSubmit} className="space-y-4">
              <InputField
                label="Email Address"
                type="email"
                required
                placeholder="colleague@zylo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                leftIcon={<Mail className="w-4 h-4" />}
              />

              <InputField
                label="Full Name (Optional)"
                type="text"
                placeholder="e.g. Alex Morgan"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />

              <SelectField
                label="Administrative Role"
                options={ROLE_OPTIONS}
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
              />

              {/* Custom Permissions Toggle */}
              <div className="pt-1 border-t border-slate-100">
                <div className="flex items-center justify-between py-1">
                  <div>
                    <p className="font-semibold text-slate-700">Custom Granular Permissions</p>
                    <p className="text-[11px] text-slate-400">
                      Override standard role permissions for this specific user.
                    </p>
                  </div>
                  <input
                    type="checkbox"
                    name="customPerms"
                    checked={useCustomPermissions}
                    onChange={(e) => setUseCustomPermissions(e.target.checked)}
                    className="w-4 h-4 rounded border-slate-300 text-[#299cdb] focus:ring-[#299cdb] cursor-pointer"
                  />
                </div>

                {/* Granular Matrix Accordion (only visible if enabled) */}
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

              {/* Actions */}
              <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-100">
                <Button type="button" variant="ghost" onClick={resetAndClose} className="py-2 text-xs">
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  isLoading={isSubmitting}
                  leftIcon={<Shield className="w-3.5 h-3.5" />}
                  className="py-2 text-xs"
                >
                  Send Invitation
                </Button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default InviteStaffModal;
