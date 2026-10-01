import React from 'react';
import { KeyRound, Lock, MoreHorizontal, Pencil, Shield, Trash2, Unlock } from 'lucide-react';
import Button from '@shared/ui/Button';
import Menu from '@shared/ui/Menu';
import { useAuth } from '@shared/auth/AuthContext';
import type { StaffUserDetail } from '../../../../services/staffUsers.service';

export interface UserDetailsActionsProps {
  user: StaffUserDetail;
  isSelf: boolean;
  onEdit: () => void;
  onChangeRole: () => void;
  onResetPassword: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

/** Header actions for a profile. Role, status and delete are never offered on your own account. */
export const UserDetailsActions: React.FC<UserDetailsActionsProps> = ({
  user,
  isSelf,
  onEdit,
  onChangeRole,
  onResetPassword,
  onToggleStatus,
  onDelete,
}) => {
  const { can } = useAuth();
  const active = user.status === 'ACTIVE';

  return (
    <>
      {can('users.edit') && (
        <Button size="sm" variant="outline" leftIcon={<Pencil />} onClick={onEdit}>
          Edit
        </Button>
      )}
      {can('roles.assign') && !isSelf && (
        <Button size="sm" variant="outline" leftIcon={<Shield />} onClick={onChangeRole}>
          Change role
        </Button>
      )}
      <Menu
        trigger={(props) => (
          <button
            {...props}
            type="button"
            aria-label={`More actions for ${user.name}`}
            className="flex h-8 w-8 items-center justify-center rounded-md border border-zinc-200 bg-white text-zinc-500 transition-colors hover:bg-zinc-50 hover:text-zinc-900"
          >
            <MoreHorizontal className="h-4 w-4" />
          </button>
        )}
        items={[
          { key: 'reset', label: 'Send password reset', icon: <KeyRound />, onSelect: onResetPassword, hidden: !can('users.edit') },
          {
            key: 'status',
            label: active ? 'Suspend' : 'Reactivate',
            icon: active ? <Lock /> : <Unlock />,
            onSelect: onToggleStatus,
            hidden: !can('users.activate') || isSelf,
          },
          {
            key: 'delete',
            label: 'Delete user',
            icon: <Trash2 />,
            onSelect: onDelete,
            danger: true,
            hidden: !can('users.delete') || isSelf,
            separatorBefore: true,
          },
        ]}
      />
    </>
  );
};

export default UserDetailsActions;
