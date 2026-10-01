import React, { useState, useEffect } from 'react';
import { Shield, Send } from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { invitationsService } from '../../services/invitations.service';
import { rolesService, type Role } from '../../services/roles.service';
import { extractErrorMessage } from '@shared/api/client';

export interface InviteUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suggestedUserCode?: string;
}

export const InviteUserDrawer: React.FC<InviteUserDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  suggestedUserCode,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [userCode, setUserCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [roleId, setRoleId] = useState('');
  const [message, setMessage] = useState('');

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoadingRoles(true);
      rolesService
        .listRoles()
        .then((res: any) => {
          const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
          const activeRoles = list.filter((r: Role) => r.status === 'ACTIVE');
          setRoles(activeRoles);
          // Default to Operations Manager or first non-super-admin active role
          const defaultRole = activeRoles.find((r: Role) => r.key === 'operations_manager') || activeRoles[0];
          if (defaultRole) {
            setRoleId(defaultRole.id);
          }
        })
        .catch((err) => {
          toast.error(extractErrorMessage(err));
          setRoles([]);
        })
        .finally(() => {
          setIsLoadingRoles(false);
        });

      if (suggestedUserCode) {
        setUserCode(suggestedUserCode);
      }
    } else {
      // Reset form on close
      setFirstName('');
      setLastName('');
      setEmail('');
      setUserCode('');
      setDesignation('');
      setMessage('');
    }
  }, [isOpen, suggestedUserCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required');
      return;
    }

    if (!email.trim() || !email.includes('@')) {
      toast.error('Please enter a valid work email address');
      return;
    }

    if (!userCode.trim()) {
      toast.error('Staff User ID code is required (e.g. ZY-0003)');
      return;
    }

    if (!roleId) {
      toast.error('Please select an active role for this staff member');
      return;
    }

    try {
      setIsSubmitting(true);
      await invitationsService.createInvitation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        userCode: userCode.trim().toUpperCase(),
        designation: designation.trim() || undefined,
        roleIds: [roleId],
        message: message.trim() || undefined,
      });

      toast.success(`Invitation successfully sent to ${email}`);
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = roles.find((r) => r.id === roleId);

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Invite Team Member"
      description="Send a secure, single-use invitation link with pre-assigned role and permissions."
      size="md"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            leftIcon={<Send className="w-4 h-4" />}
          >
            Send Invitation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Sarah"
            required
            autoFocus
          />
          <InputField
            label="Last Name"
            name="lastName"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="e.g. Jenkins"
            required
          />
        </div>

        <InputField
          label="Work Email"
          name="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="s.jenkins@company.com"
          helperText="Invitation link will be emailed to this address (valid for 7 days)."
          required
        />

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="User Code"
            name="userCode"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            placeholder="e.g. ZY-0003"
            helperText="Unique staff identifier"
            required
          />
          <InputField
            label="Designation"
            name="designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Senior Catalog Lead"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Assigned Role <span className="text-rose-500">*</span>
          </label>
          {isLoadingRoles ? (
            <div className="h-10 bg-slate-100 animate-pulse rounded-md" />
          ) : (
            <select
              value={roleId}
              onChange={(e) => setRoleId(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
            >
              {roles.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name} {r.isSystem ? '(System)' : ''} — {r.permissions.length} permissions
                </option>
              ))}
            </select>
          )}

          {selectedRole && (
            <div className="mt-2.5 p-3 rounded-md bg-indigo-50/60 border border-indigo-100 text-xs">
              <div className="flex items-center gap-1.5 font-bold text-indigo-900 mb-1">
                <Shield className="w-3.5 h-3.5 text-indigo-600" />
                <span>{selectedRole.name}</span>
                {selectedRole.isSystem && (
                  <span className="ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-indigo-200/60 text-indigo-800">
                    System Role
                  </span>
                )}
              </div>
              <p className="text-indigo-700/80 leading-relaxed">
                {selectedRole.description || 'Pre-configured access controls and system permissions.'}
              </p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Personal Note (Optional)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            placeholder="Welcome to the team! Here is your access link to our administration workspace..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
          />
        </div>
      </form>
    </Drawer>
  );
};

export default InviteUserDrawer;
