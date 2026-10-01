import React, { useState, useEffect } from 'react';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { staffUsersService, type StaffUserItem, type StaffUserDetail } from '../../services/staffUsers.service';
import { extractErrorMessage } from '@shared/api/client';
import { Save } from 'lucide-react';

export interface EditUserDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUserItem | StaffUserDetail | null;
  onSuccess: () => void;
}

export const EditUserDrawer: React.FC<EditUserDrawerProps> = ({
  isOpen,
  onClose,
  user,
  onSuccess,
}) => {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [userCode, setUserCode] = useState('');
  const [designation, setDesignation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user && isOpen) {
      setFirstName(user.firstName || user.name.split(' ')[0] || '');
      setLastName(user.lastName || user.name.split(' ').slice(1).join(' ') || '');
      setUserCode(user.userCode || '');
      setDesignation(user.designation || '');
    }
  }, [user, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!userCode.trim()) {
      toast.error('User ID code cannot be empty');
      return;
    }

    try {
      setIsSubmitting(true);
      await staffUsersService.updateProfile(user.id, {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        userCode: userCode.trim().toUpperCase(),
        designation: designation.trim() || undefined,
      });

      toast.success('Staff profile updated successfully');
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
      title="Edit Staff Profile"
      description={`Update metadata and profile attributes for ${user.email}.`}
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
            leftIcon={<Save className="w-4 h-4" />}
          >
            Save Changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="p-3 bg-slate-50 rounded-md border border-slate-200/80 mb-2">
          <div className="text-xs text-slate-500 font-medium">Work Email (Primary Identifier)</div>
          <div className="text-sm font-semibold text-slate-800 mt-0.5">{user.email}</div>
          <div className="text-[11px] text-slate-400 mt-1">
            Email addresses are fixed per security policy to maintain immutable audit links.
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="First Name"
            name="firstName"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="e.g. Sarah"
            required
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

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="User Code"
            name="userCode"
            value={userCode}
            onChange={(e) => setUserCode(e.target.value.toUpperCase())}
            placeholder="e.g. ZY-0001"
            helperText="Unique staff ID code"
            required
          />
          <InputField
            label="Designation"
            name="designation"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            placeholder="e.g. Lead Operations Specialist"
          />
        </div>

        <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-md text-xs text-amber-800">
          <span className="font-bold">Role Assignment:</span> To modify role or permissions, use the dedicated "Change Role" option to ensure privilege hierarchy checks and audit logs are recorded.
        </div>
      </form>
    </Drawer>
  );
};

export default EditUserDrawer;
