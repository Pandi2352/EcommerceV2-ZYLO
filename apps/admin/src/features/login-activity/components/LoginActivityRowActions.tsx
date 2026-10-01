import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Copy, Eye, LogOut, MoreHorizontal } from 'lucide-react';
import Menu from '@shared/ui/Menu';
import { useAuth } from '@shared/auth/AuthContext';
import type { LoginActivityItem } from '../../../services/loginActivity.service';

export interface LoginActivityRowHandlers {
  onCopyIp: (ip: string) => void;
  onRevokeSessions: (item: LoginActivityItem) => void;
}

/** "⋯" menu: open the staff profile, copy the IP, revoke the user's sessions (permission-gated). */
export const LoginActivityRowActions: React.FC<{ item: LoginActivityItem } & LoginActivityRowHandlers> = ({
  item,
  onCopyIp,
  onRevokeSessions,
}) => {
  const navigate = useNavigate();
  const { user: me, can } = useAuth();
  const canRevoke = can('users.edit') && Boolean(item.userId) && item.userId !== me?.id;

  return (
    <Menu
      trigger={(props) => (
        <button
          {...props}
          type="button"
          aria-label={`More actions for ${item.email}`}
          className="flex h-7 w-7 items-center justify-center rounded-md text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900"
        >
          <MoreHorizontal className="h-4 w-4" />
        </button>
      )}
      items={[
        {
          key: 'profile',
          label: 'View profile',
          icon: <Eye />,
          onSelect: () => navigate(`/users/${item.userId}`),
          hidden: !item.userId,
        },
        { key: 'copy', label: 'Copy IP address', icon: <Copy />, onSelect: () => onCopyIp(item.ip) },
        {
          key: 'revoke',
          label: 'Revoke all sessions',
          icon: <LogOut />,
          onSelect: () => onRevokeSessions(item),
          hidden: !canRevoke,
          danger: true,
          separatorBefore: true,
        },
      ]}
    />
  );
};

export default LoginActivityRowActions;
