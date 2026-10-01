import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, KeyRound, Lock, MoreHorizontal, Pencil, Shield, Trash2, Unlock } from 'lucide-react';
import Button from '@shared/ui/Button';
import Menu from '@shared/ui/Menu';
import { useAuth } from '@shared/auth/AuthContext';
import type { StaffUserItem } from '../../../services/staffUsers.service';

export interface UserRowHandlers {
  onEdit: (user: StaffUserItem) => void;
  onChangeRole: (user: StaffUserItem) => void;
  onToggleStatus: (user: StaffUserItem) => void;
  onResetPassword: (user: StaffUserItem) => void;
  onDelete: (user: StaffUserItem) => void;
}

/** Inline Edit / Delete plus a "⋯" menu for the less frequent actions. Permission-gated. */
export const UserRowActions: React.FC<{ user: StaffUserItem } & UserRowHandlers> = ({
  user,
  onEdit,
  onChangeRole,
  onToggleStatus,
  onResetPassword,
  onDelete,
}) => {
  const navigate = useNavigate();
  const { user: me, can } = useAuth();
  const isSelf = me?.id === user.id;
  const active = user.status === 'ACTIVE';

  return (
    <div className="flex items-center justify-end gap-1.5">
      {can('users.edit') && (
        <Button size="xs" variant="outline" leftIcon={<Pencil />} onClick={() => onEdit(user)}>
          Edit
        </Button>
      )}
      {can('users.delete') && !isSelf && (
        <Button size="xs" variant="outline" leftIcon={<Trash2 />} onClick={() => onDelete(user)}>
          Delete
        </Button>
      )}
      <Menu
        trigger={(props) => (
          <button
            {...props}
            type="button"
            aria-label={`More actions for ${user.name}`}
            className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
        items={[
          { key: 'view', label: 'View profile', icon: <Eye />, onSelect: () => navigate(`/users/${user.id}`) },
          { key: 'role', label: 'Change role', icon: <Shield />, onSelect: () => onChangeRole(user), hidden: !can('roles.assign') || isSelf },
          { key: 'reset', label: 'Send password reset', icon: <KeyRound />, onSelect: () => onResetPassword(user), hidden: !can('users.edit') },
          {
            key: 'status',
            label: active ? 'Suspend' : 'Reactivate',
            icon: active ? <Lock /> : <Unlock />,
            onSelect: () => onToggleStatus(user),
            hidden: !can('users.activate') || isSelf,
            separatorBefore: true,
          },
        ]}
      />
    </div>
  );
};

export default UserRowActions;
