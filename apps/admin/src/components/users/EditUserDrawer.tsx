import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { staffUsersService, type StaffUserItem, type StaffUserDetail } from '../../services/staffUsers.service';

export interface EditUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUserItem | StaffUserDetail | null;
  onSuccess: () => void;
}

const FORM_ID = 'edit-user-form';
const EMPTY = { firstName: '', lastName: '', userCode: '', designation: '' };
type FormState = typeof EMPTY & { session: string | null };

const fromUser = (user: StaffUserItem | StaffUserDetail) => ({
  firstName: user.firstName || user.name.split(' ')[0] || '',
  lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
  userCode: user.userCode || '',
  designation: user.designation || '',
});

/** Side panel to edit a staff user's name, user ID and designation. Email and role are edited elsewhere. */
export const EditUserDrawer: React.FC<EditUserDrawerProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>({ session: null, ...EMPTY });

  // Re-seed the fields from the user each time the drawer opens
  const session = isOpen && user ? user.id : null;
  if (form.session !== session) {
    setForm({ session, ...(user && isOpen ? fromUser(user) : EMPTY) });
    setCodeError(null);
  }
  const { firstName, lastName, userCode, designation } = form;
  const update = (patch: Partial<typeof EMPTY>) => setForm((f) => ({ ...f, ...patch }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!userCode.trim()) {
      setCodeError('User ID is required.');
      return;
    }

    setIsSubmitting(true);
    try {
      await staffUsersService.updateProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userCode: userCode.trim().toUpperCase(),
        designation: designation.trim() || undefined,
      });
      const name = `${firstName.trim()} ${lastName.trim()}`.trim() || user.name;
      const profilePath = `/users/${user.id}`;
      toast.success('Details have been successfully updated.', {
        title: `"${name}" details updated`,
        actions: pathname === profilePath ? undefined : [{ label: 'View profile', onClick: () => navigate(profilePath) }],
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) return null;

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Edit user"
      description={user.email}
      size="md"
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" form={FORM_ID} isLoading={isSubmitting}>
            Save changes
          </Button>
        </>
      }
    >
      <form id={FORM_ID} onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <InputField
            fieldSize="sm"
            label="First name"
            name="firstName"
            value={firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            placeholder="Sarah"
            required
            autoFocus
          />
          <InputField
            fieldSize="sm"
            label="Last name"
            name="lastName"
            value={lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            placeholder="Jenkins"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            fieldSize="sm"
            label="User ID"
            name="userCode"
            value={userCode}
            onChange={(e) => {
              update({ userCode: e.target.value.toUpperCase() });
              setCodeError(null);
            }}
            placeholder="ZY-0001"
            error={codeError}
            required
            className="font-mono"
          />
          <InputField
            fieldSize="sm"
            label="Designation"
            name="designation"
            value={designation}
            onChange={(e) => update({ designation: e.target.value })}
            placeholder="Operations lead"
          />
        </div>

        <div className="space-y-1 border-t border-zinc-100 pt-4 text-xs text-zinc-500">
          <p>
            <span className="font-medium text-zinc-700">Email</span> can't be changed; it keeps audit history linked to this account.
          </p>
          <p>
            <span className="font-medium text-zinc-700">Role</span> is changed with Change role, so the change is checked and logged.
          </p>
        </div>
      </form>
    </Drawer>
  );
};

export default EditUserDrawer;
