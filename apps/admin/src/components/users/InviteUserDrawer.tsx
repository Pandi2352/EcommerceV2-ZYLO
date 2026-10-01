import React, { useEffect, useMemo, useState } from 'react';
import { Send, UserCog } from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Dropdown from '@shared/ui/Dropdown';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { cn } from '@shared/utils/cn';
import { extractErrorMessage } from '@shared/api/client';
import { invitationsService } from '../../services/invitations.service';
import { useRoleOptions } from '../../features/roles/hooks/useRoleOptions';

export interface InviteUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  suggestedUserCode?: string;
}

const MESSAGE_MAX = 500;
type Field = 'name' | 'email' | 'userCode' | 'roleId';

export const InviteUserDrawer: React.FC<InviteUserDrawerProps> = ({ isOpen, onClose, onSuccess, suggestedUserCode }) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [typedUserCode, setTypedUserCode] = useState<string | null>(null);
  const [designation, setDesignation] = useState('');
  const [pickedRoleId, setPickedRoleId] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<Partial<Record<Field, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { roles, options, isLoading: isLoadingRoles, error: rolesError } = useRoleOptions({ activeOnly: true });
  const activeRoles = useMemo(() => roles.filter((r) => r.status === 'ACTIVE'), [roles]);
  const roleOptions = useMemo(
    () =>
      options.map((o) => {
        const role = activeRoles.find((r) => r.id === o.value);
        const perms = role ? `${role.permissions.length} permissions` : undefined;
        return { ...o, description: role?.isSystem ? `System role · ${perms}` : perms };
      }),
    [options, activeRoles],
  );

  useEffect(() => {
    if (rolesError) toast.error(rolesError.message);
  }, [rolesError]);

  // Default to Operations Manager, else the first active role, until the user picks one
  const defaultRoleId = (activeRoles.find((r) => r.key === 'operations_manager') ?? activeRoles[0])?.id ?? '';
  const roleId = pickedRoleId || defaultRoleId;
  // Prefill the suggested code until the user edits the field
  const userCode = typedUserCode ?? suggestedUserCode ?? '';

  const close = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setTypedUserCode(null);
    setDesignation('');
    setPickedRoleId('');
    setMessage('');
    setErrors({});
    onClose();
  };

  const validate = () => {
    const next: Partial<Record<Field, string>> = {};
    if (!firstName.trim() || !lastName.trim()) next.name = 'First and last name are required';
    if (!email.trim() || !email.includes('@')) next.email = 'Please enter a valid work email address';
    if (!userCode.trim()) next.userCode = 'Staff User ID code is required (e.g. ZY-0003)';
    if (!roleId) next.roleId = 'Please select an active role for this staff member';
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const normalizedEmail = email.trim().toLowerCase();
    try {
      setIsSubmitting(true);
      await invitationsService.createInvitation({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: normalizedEmail,
        userCode: userCode.trim().toUpperCase(),
        designation: designation.trim() || undefined,
        roleIds: [roleId],
        message: message.trim() || undefined,
      });

      toast.success(`We emailed a sign-up link to ${normalizedEmail}. It's valid for 7 days.`, { title: 'Invitation sent' });
      onSuccess();
      close();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedRole = activeRoles.find((r) => r.id === roleId);
  const clearError = (field: Field) => {
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={close}
      title="Invite user"
      description="Send a single-use sign-up link with a pre-assigned role."
      size="md"
      footer={
        <>
          <Button size="sm" variant="outline" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={handleSubmit} isLoading={isSubmitting} leftIcon={<Send />}>
            Send invitation
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <div className="grid grid-cols-2 gap-3">
            <InputField fieldSize="sm" label="First name" name="firstName" value={firstName} maxLength={60} required autoFocus
              onChange={(e) => { setFirstName(e.target.value); clearError('name'); }} placeholder="Sarah" />
            <InputField fieldSize="sm" label="Last name" name="lastName" value={lastName} maxLength={60} required
              onChange={(e) => { setLastName(e.target.value); clearError('name'); }} placeholder="Jenkins" />
          </div>
          {errors.name && <p className="mt-1 text-xs font-medium text-rose-600">{errors.name}</p>}
        </div>

        <InputField fieldSize="sm" label="Work email" name="email" type="email" value={email} required error={errors.email}
          onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
          placeholder="s.jenkins@company.com" helperText="The sign-up link is sent here and stays valid for 7 days." />

        <div className="grid grid-cols-2 gap-3">
          <InputField fieldSize="sm" label="User ID" name="userCode" value={userCode} maxLength={30} required error={errors.userCode}
            onChange={(e) => { setTypedUserCode(e.target.value.toUpperCase()); clearError('userCode'); }}
            placeholder="ZY-0003" helperText="Unique staff identifier" />
          <InputField fieldSize="sm" label="Designation" name="designation" value={designation} maxLength={80}
            onChange={(e) => setDesignation(e.target.value)} placeholder="Senior Catalog Lead" />
        </div>

        <Dropdown
          label="Role"
          required
          value={roleId}
          onChange={(v) => { setPickedRoleId(v); clearError('roleId'); }}
          options={roleOptions}
          leftIcon={<UserCog className="h-3.5 w-3.5" />}
          placeholder={isLoadingRoles ? 'Loading roles…' : 'Select a role'}
          disabled={isLoadingRoles}
          searchable={roleOptions.length > 7}
          emptyText="No active roles"
          error={errors.roleId}
          helperText={selectedRole ? selectedRole.description || 'Access is defined by the permissions on this role.' : undefined}
        />

        <div>
          <div className="mb-1.5 flex items-baseline justify-between">
            <label htmlFor="invite-message" className="text-[13px] font-medium text-zinc-800">
              Personal note <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <span className={cn('text-xs tabular-nums', message.length >= MESSAGE_MAX ? 'text-rose-600' : 'text-zinc-400')}>
              {message.length}/{MESSAGE_MAX}
            </span>
          </div>
          <textarea
            id="invite-message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            maxLength={MESSAGE_MAX}
            placeholder="Welcome to the team! Here's your access to the admin console."
            className="w-full resize-none rounded-md border border-zinc-200 bg-white px-3 py-2 text-[13px] text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 hover:border-zinc-300 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/5"
          />
        </div>
      </form>
    </Drawer>
  );
};

export default InviteUserDrawer;
