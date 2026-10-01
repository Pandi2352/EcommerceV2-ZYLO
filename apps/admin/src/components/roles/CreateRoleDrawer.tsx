import React, { useState } from 'react';
import Drawer from '@shared/ui/Drawer';
import InputField from '@shared/ui/InputField';
import Button from '@shared/ui/Button';
import { toast } from '@shared/ui/Toast';
import { rolesService, type Role } from '../../services/roles.service';
import { extractErrorMessage } from '@shared/api/client';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export interface CreateRoleDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  existingRoles: Role[];
}

export const CreateRoleDrawer: React.FC<CreateRoleDrawerProps> = ({
  isOpen,
  onClose,
  onSuccess,
  existingRoles,
}) => {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [cloneRoleId, setCloneRoleId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-slugify role key on name change if key hasn't been manually diverged
  const handleNameChange = (val: string) => {
    setName(val);
    const slug = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    setKey(slug);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Role name is required');
      return;
    }

    if (!key.trim()) {
      toast.error('Role key identifier is required');
      return;
    }

    const cloned = existingRoles.find((r) => r.id === cloneRoleId);
    const initialPermissions = cloned ? cloned.permissions : [];

    try {
      setIsSubmitting(true);
      const created = await rolesService.createRole({
        name: name.trim(),
        key: key.trim().toLowerCase(),
        description: description.trim() || undefined,
        permissions: initialPermissions,
      });

      toast.success(`Role "${created.name}" created successfully`);
      onSuccess();
      onClose();
      navigate(`/roles/${created.id}`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer
      isOpen={isOpen}
      onClose={onClose}
      title="Create Custom Role"
      description="Define a new administrative role with tailored access controls and operational permissions."
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
            leftIcon={<Plus className="w-4 h-4" />}
          >
            Create & Configure
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <InputField
          label="Role Name"
          name="name"
          value={name}
          onChange={(e) => handleNameChange(e.target.value)}
          placeholder="e.g. Warehouse Lead"
          helperText="Human-readable title displayed throughout console"
          required
          autoFocus
        />

        <InputField
          label="Role Key Identifier"
          name="key"
          value={key}
          onChange={(e) => setKey(e.target.value.toLowerCase())}
          placeholder="e.g. warehouse_lead"
          helperText="Immutable, snake_case system identifier used in code and logs"
          required
        />

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Role Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Oversees warehouse receiving, stock adjustments, and fulfillment dispatches..."
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors resize-none"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1.5">
            Clone Permissions From (Optional)
          </label>
          <select
            value={cloneRoleId}
            onChange={(e) => setCloneRoleId(e.target.value)}
            className="w-full px-3 py-2 bg-white border border-slate-300 rounded-md text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-colors"
          >
            <option value="">Start with blank permissions</option>
            {existingRoles.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.permissions.length} permissions)
              </option>
            ))}
          </select>
          <p className="text-[11px] text-slate-400 mt-1">
            You will be redirected to the Permissions Matrix to fine-tune individual module toggles after creation.
          </p>
        </div>
      </form>
    </Drawer>
  );
};

export default CreateRoleDrawer;
