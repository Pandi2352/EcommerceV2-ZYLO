import { Link } from 'react-router-dom';
import { Briefcase, Calendar, CircleDot, Hash, LogIn, Mail, ShieldCheck, User, UserCog } from 'lucide-react';
import Avatar from '@shared/ui/Avatar';
import Badge from '@shared/ui/Badge';
import StatusPill from '@shared/ui/StatusPill';
import type { DataTableColumn } from '@shared/ui/DataTable';
import { formatDateTime } from '@shared/utils/format';
import type { StaffUserItem } from '../../../services/staffUsers.service';
import UserRowActions, { type UserRowHandlers } from './UserRowActions';

const muted = <span className="text-zinc-400">—</span>;

/** Column definitions for the staff users table. */
export function usersColumns(currentUserId: string | undefined, handlers: UserRowHandlers): DataTableColumn<StaffUserItem>[] {
  return [
    {
      key: 'name',
      header: 'Full name',
      icon: <User />,
      sortKey: 'name',
      render: (u) => (
        <div className="flex items-center gap-2">
          <Avatar name={u.name} size="sm" />
          <Link to={`/users/${u.id}`} className="font-medium text-zinc-900 hover:underline">
            {u.name}
          </Link>
          {u.id === currentUserId && <Badge>You</Badge>}
        </div>
      ),
    },
    {
      key: 'email',
      header: 'Email',
      icon: <Mail />,
      sortKey: 'email',
      render: (u) => (
        <a href={`mailto:${u.email}`} className="text-zinc-600 underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900">
          {u.email}
        </a>
      ),
    },
    {
      key: 'userCode',
      header: 'User ID',
      icon: <Hash />,
      sortKey: 'userCode',
      render: (u) => (u.userCode ? <span className="font-mono text-xs text-zinc-600">{u.userCode}</span> : muted),
    },
    { key: 'role', header: 'Role', icon: <UserCog />, render: (u) => u.roleName || muted },
    {
      key: 'designation',
      header: 'Designation',
      icon: <Briefcase />,
      sortKey: 'designation',
      render: (u) => (u.designation ? <span className="text-zinc-600">{u.designation}</span> : muted),
    },
    {
      key: 'status',
      header: 'Status',
      icon: <CircleDot />,
      sortKey: 'status',
      render: (u) => (
        <div className="flex items-center gap-1">
          <StatusPill tone={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status === 'ACTIVE' ? 'Active' : 'Inactive'}</StatusPill>
          {u.isLocked && <StatusPill tone="warning">Locked</StatusPill>}
        </div>
      ),
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      icon: <LogIn />,
      sortKey: 'lastLoginAt',
      render: (u) => (u.lastLoginAt ? <span className="tabular-nums text-zinc-600">{formatDateTime(u.lastLoginAt)}</span> : <span className="text-zinc-400">Never</span>),
    },
    {
      key: 'joined',
      header: 'Joined date',
      icon: <Calendar />,
      sortKey: 'createdAt',
      render: (u) => <span className="tabular-nums text-zinc-600">{formatDateTime(u.createdAt)}</span>,
    },
    {
      key: 'mfa',
      header: '2F Auth',
      icon: <ShieldCheck />,
      render: (u) => (u.mfaEnabled ? <Badge tone="highlight">Enabled</Badge> : <Badge>Disabled</Badge>),
    },
    {
      key: 'actions',
      sticky: 'right',
      header: 'Actions',
      align: 'right',
      render: (u) => <UserRowActions user={u} {...handlers} />,
    },
  ];
}
