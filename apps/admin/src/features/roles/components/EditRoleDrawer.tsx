import React, { useState } from 'react';
import { Save } from 'lucide-react';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { rolesService, type Role } from '../../../services/roles.service';
import TextAreaField from './TextAreaField';

export interface EditRoleDrawerProps {
  role: Role | null;
  onClose: () => void;
  onSaved: (role: Role) => void;
}

/** Edit a role's name and description (status is changed via Activate / Deactivate). */
export const EditRoleDrawer: React.FC<EditRoleDrawerProps> = ({ role, onClose, onSaved }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [loadedFor, setLoadedFor] = useState<Role | null>(null);

  // Reset the form whenever a different role is opened
  if (role !== loadedFor) {
    setLoadedFor(role);
    setName(role?.name ?? '');
    setDescription(role?.description ?? '');
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!role) return;
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    try {
      setIsSaving(true);
      const updated = await rolesService.updateRole(role.id, {
        name: name.trim(),
        description: description.trim() || undefined,
      });
      onSaved(updated);
      toast.success('Name and description were saved.', { title: `"${updated.name}" updated` });
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Drawer
      isOpen={!!role}
      onClose={onClose}
      title="Edit role"
      description={role ? <span className="font-mono">{role.key}</span> : undefined}
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={() => handleSubmit()} isLoading={isSaving} leftIcon={<Save />}>
            Save changes
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField fieldSize="sm" label="Role name" value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        <TextAreaField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What this role is responsible for"
        />
      </form>
    </Drawer>
  );
};

export default EditRoleDrawer;
