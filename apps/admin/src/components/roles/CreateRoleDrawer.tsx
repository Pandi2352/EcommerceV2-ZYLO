import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Dropdown from '@shared/ui/Dropdown';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { rolesService, type Role } from '../../services/roles.service';
import TextAreaField from '../../features/roles/components/TextAreaField';
import { hasAllPermissions, pluralize } from '../../features/roles/lib/roleRules';

export interface CreateRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingRoles: Role[];
}

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');

export const CreateRoleDrawer: React.FC<CreateRoleDrawerProps> = ({ isOpen, onClose, onSuccess, existingRoles }) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [keyEdited, setKeyEdited] = useState(false);
  const [description, setDescription] = useState('');
  const [cloneRoleId, setCloneRoleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // The key follows the name until the user types their own
  const handleNameChange = (value: string) => {
    setName(value);
    if (!keyEdited) setKey(slugify(value));
  };

  const reset = () => {
    setName('');
    setKey('');
    setKeyEdited(false);
    setDescription('');
    setCloneRoleId('');
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }
    if (!key.trim()) {
      toast.error('Role key identifier is required');
      return;
    }

    const cloned = existingRoles.find((r) => r.id === cloneRoleId);

    try {
      setIsSubmitting(true);
      const created = await rolesService.createRole({
        name: name.trim(),
        key: key.trim().toLowerCase(),
        description: description.trim() || undefined,
        permissions: cloned ? cloned.permissions : [],
      });
      toast.success(cloned ? `Permissions were copied from "${cloned.name}".` : 'Choose its permissions next.', {
        title: `"${created.name}" created`,
      });
      reset();
      onSuccess();
      onClose();
      navigate(`/roles/${created.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const cloneOptions = existingRoles.map((r) => ({
    value: r.id,
    label: r.name,
    description: hasAllPermissions(r) ? 'All permissions' : pluralize(r.permissions.length, 'permission'),
  }));

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create role"
      description="A custom role groups the permissions a team needs."
      size="md"
      footer={
        <>
          <Button size="sm" variant="outline" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" onClick={() => handleSubmit()} isLoading={isSubmitting} leftIcon={<Plus />}>
            Create and configure
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          fieldSize="sm"
          label="Role name"
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Warehouse Lead"
          helperText="Shown throughout the console."
          required
          autoFocus
        />
        <InputField
          fieldSize="sm"
          label="Key"
          name="key"
          value={key}
          onChange={(e) => {
            setKeyEdited(true);
            setKey(e.target.value.toLowerCase());
          }}
          placeholder="e.g. warehouse_lead"
          helperText="snake_case identifier used in code and audit logs. It can't be changed later."
          className="font-mono"
          required
        />
        <TextAreaField
          label="Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Oversees warehouse receiving, stock adjustments and dispatch."
        />
        <Dropdown
          label="Copy permissions from"
          value={cloneRoleId}
          onChange={setCloneRoleId}
          options={cloneOptions}
          placeholder="Start with no permissions"
          searchable={cloneOptions.length > 7}
          clearable
          helperText="You can fine-tune individual permissions after the role is created."
        />
      </form>
    </Drawer>
  );
};

export default CreateRoleDrawer;
