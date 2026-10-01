import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, MoreHorizontal, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import Button from '@shared/ui/Button';
import Menu from '@shared/ui/Menu';
import { useAuth } from '@shared/auth/AuthContext';
import type { Role } from '../../../services/roles.service';
import { roleRestrictions } from '../lib/roleRules';

export interface RoleRowHandlers {
  onEdit: (role: Role) => void;
  onToggleStatus: (role: Role) => void;
  onDelete: (role: Role) => void;
}

/** Short reason appended to a disabled menu item, e.g. "Delete · system role". */
const withReason = (label: string, reason: string | null, short: string) => (reason ? `${label} · ${short}` : label);

/** Inline View plus a "⋯" menu. Clicks never reach the row's navigate handler. */
export const RoleRowActions: React.FC<{ role: Role } & RoleRowHandlers> = ({ role, onEdit, onToggleStatus, onDelete }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const blocked = roleRestrictions(role);
  const active = role.status === 'ACTIVE';
  const users = role.userCount ?? 0;

  return (
    <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
      <Button size="xs" variant="outline" leftIcon={<Eye />} onClick={() => navigate(`/roles/${role.id}`)}>
        View
      </Button>
      <Menu
        trigger={(props) => (
          <button
            {...props}
            type="button"
            aria-label={`More actions for ${role.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
        items={[
          {
            key: 'edit',
            label: withReason('Edit details', blocked.edit, 'protected'),
            icon: <Pencil />,
            onSelect: () => onEdit(role),
            disabled: !!blocked.edit,
            hidden: !can('roles.edit'),
          },
          {
            key: 'status',
            label: withReason(active ? 'Deactivate' : 'Activate', blocked.status, 'protected'),
            icon: active ? <PowerOff /> : <Power />,
            onSelect: () => onToggleStatus(role),
            disabled: !!blocked.status,
            hidden: !can('roles.edit'),
          },
          {
            key: 'delete',
            label: withReason('Delete', blocked.delete, role.isSystem ? 'system role' : `${users} user${users === 1 ? '' : 's'}`),
            icon: <Trash2 />,
            onSelect: () => onDelete(role),
            disabled: !!blocked.delete,
            danger: !blocked.delete,
            hidden: !can('roles.delete'),
            separatorBefore: true,
          },
        ]}
      />
    </div>
  );
};

export default RoleRowActions;
