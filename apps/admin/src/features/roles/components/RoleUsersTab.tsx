import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Calendar, CircleDot, Eye, Hash, LogIn, Mail, Shield, User, Users } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import DataTable, { type DataTableColumn } from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Avatar from '@shared/ui/Avatar';
import Button from '@shared/ui/Button';
import StatusPill from '@shared/ui/StatusPill';
import { formatDateTime } from '@shared/utils/format';
import type { Role } from '../../../services/roles.service';
import type { StaffUserItem } from '../../../services/staffUsers.service';
import ChangeRoleDialog from '../../../components/users/ChangeRoleDialog';
import type { RoleHolder, RoleUsersState } from '../hooks/useRoleUsers';

const muted = <span className="text-zinc-400">—</span>;
const fullName = (u: RoleHolder) => u.name || `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() || u.email;

/** Holders of the role, with a link to each profile and a "Change role" shortcut. */
export const RoleUsersTab: React.FC<{ role: Role; state: RoleUsersState; onRoleChanged: () => void }> = ({ role, state, onRoleChanged }) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const [changing, setChanging] = useState<StaffUserItem | null>(null);

  const startChange = (u: RoleHolder) =>
    setChanging({ id: u.id, name: fullName(u), email: u.email, roleIds: [role.id], roleName: role.name, roleKey: role.key } as StaffUserItem);

  const columns: DataTableColumn<RoleHolder>[] = [
    {
      key: 'name',
      header: 'Full name',
      icon: <User />,
      render: (u) => (
        <div className="flex items-center gap-2">
          <Avatar name={fullName(u)} size="sm" />
          <Link to={`/users/${u.id}`} className="font-medium text-zinc-900 hover:underline">{fullName(u)}</Link>
        </div>
      ),
    },
    { key: 'email', header: 'Email', icon: <Mail />, render: (u) => <span className="text-zinc-600">{u.email}</span> },
    { key: 'code', header: 'User ID', icon: <Hash />, render: (u) => (u.userCode ? <span className="font-mono text-xs text-zinc-600">{u.userCode}</span> : muted) },
    {
      key: 'status',
      header: 'Status',
      icon: <CircleDot />,
      render: (u) => <StatusPill tone={u.status === 'ACTIVE' ? 'success' : 'danger'}>{u.status === 'ACTIVE' ? 'Active' : 'Inactive'}</StatusPill>,
    },
    {
      key: 'lastLogin',
      header: 'Last login',
      icon: <LogIn />,
      render: (u) => (u.lastLoginAt ? <span className="tabular-nums text-zinc-600">{formatDateTime(u.lastLoginAt)}</span> : <span className="text-zinc-400">Never</span>),
    },
    {
      key: 'joined',
      header: 'Joined date',
      icon: <Calendar />,
      render: (u) => (u.createdAt ?? u.joinedAt ? <span className="tabular-nums text-zinc-600">{formatDateTime(u.createdAt ?? u.joinedAt)}</span> : muted),
    },
    {
      key: 'actions',
      sticky: 'right',
      header: 'Actions',
      align: 'right',
      render: (u) => (
        <div className="flex items-center justify-end gap-1.5">
          <Button size="xs" variant="outline" leftIcon={<Eye />} onClick={() => navigate(`/users/${u.id}`)}>View</Button>
          {can('roles.assign') && (
            <Button size="xs" variant="outline" leftIcon={<Shield />} onClick={() => startChange(u)}>Change role</Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        rows={state.users}
        rowKey={(u) => u.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        skeletonRows={5}
        emptyState={
          <EmptyState
            icon={<Users />}
            title="Nobody has this role yet"
            description="Assign it from a user's profile or when inviting someone."
            action={<Button size="sm" variant="outline" onClick={() => navigate('/users')}>Go to users</Button>}
          />
        }
        footer={
          state.total > 10 && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.total}
              onPageChange={state.setPage}
              onPageSizeChange={state.setPageSize}
              disabled={state.isLoading}
              itemLabel="users"
            />
          )
        }
      />
      <ChangeRoleDialog
        isOpen={!!changing}
        onClose={() => setChanging(null)}
        user={changing}
        onSuccess={() => {
          state.reload();
          onRoleChanged();
        }}
      />
    </>
  );
};

export default RoleUsersTab;
