import React, { useMemo, useState } from 'react';
import { ChevronDown, Mail, UserPlus, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import PageHeader from '@shared/ui/PageHeader';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import Menu from '@shared/ui/Menu';
import { downloadCsv } from '@shared/utils/csv';
import type { StaffUserItem } from '../services/staffUsers.service';
import { useStaffUsers } from '../features/users/hooks/useStaffUsers';
import { useUserActions } from '../features/users/hooks/useUserActions';
import { usersColumns } from '../features/users/components/usersColumns';
import UsersToolbar from '../features/users/components/UsersToolbar';
import InviteUserDrawer from '../components/users/InviteUserDrawer';
import EditUserDrawer from '../components/users/EditUserDrawer';
import ChangeRoleDialog from '../components/users/ChangeRoleDialog';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const { user: me, can } = useAuth();
  const state = useStaffUsers();
  const actions = useUserActions(state.reload);

  const [selected, setSelected] = useState<string[]>([]);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [editing, setEditing] = useState<StaffUserItem | null>(null);
  const [changingRole, setChangingRole] = useState<StaffUserItem | null>(null);

  const columns = useMemo(
    () =>
      usersColumns(me?.id, {
        onEdit: setEditing,
        onChangeRole: setChangingRole,
        onToggleStatus: actions.askToggleStatus,
        onResetPassword: actions.askResetPassword,
        onDelete: actions.askDelete,
      }),
    [me?.id, actions.askToggleStatus, actions.askResetPassword, actions.askDelete],
  );

  const exportUsers = () => {
    const rows = (state.users ?? []).filter((u) => selected.length === 0 || selected.includes(u.id));
    downloadCsv(`staff-users-${new Date().toISOString().slice(0, 10)}.csv`, rows, [
      { header: 'Name', value: (u) => u.name },
      { header: 'Email', value: (u) => u.email },
      { header: 'User ID', value: (u) => u.userCode },
      { header: 'Role', value: (u) => u.roleName },
      { header: 'Designation', value: (u) => u.designation },
      { header: 'Status', value: (u) => u.status },
      { header: '2FA', value: (u) => (u.mfaEnabled ? 'Enabled' : 'Disabled') },
      { header: 'Last login', value: (u) => u.lastLoginAt ?? '' },
      { header: 'Joined', value: (u) => u.createdAt },
    ]);
  };

  const emptyState = state.hasFilters ? (
    <EmptyState
      icon={<Users />}
      title="No users match these filters"
      description="Try a different search, or clear the filters to see everyone."
      action={<Button size="sm" variant="outline" onClick={state.clearFilters}>Clear filters</Button>}
    />
  ) : (
    <EmptyState
      icon={<Users />}
      title="No staff users yet"
      description="Team members appear here once they accept an invitation."
      action={can('users.invite') && <Button size="sm" variant="primary" leftIcon={<UserPlus />} onClick={() => setInviteOpen(true)}>Invite user</Button>}
    />
  );

  return (
    <div>
      <PageHeader
        title="User management"
        count={state.meta?.total}
        description="Manage your team members and their console access."
        actions={
          can('users.invite') && (
            <Menu
              trigger={(props) => (
                <Button {...props} size="sm" variant="primary" leftIcon={<UserPlus />} rightIcon={<ChevronDown />}>
                  Add user
                </Button>
              )}
              items={[
                { key: 'invite', label: 'Invite by email', icon: <UserPlus />, onSelect: () => setInviteOpen(true) },
                { key: 'invitations', label: 'View pending invitations', icon: <Mail />, onSelect: () => navigate('/invitations') },
              ]}
            />
          )
        }
      />

      <UsersToolbar state={state} selectedCount={selected.length} onExport={exportUsers} />

      <DataTable
        columns={columns}
        rows={state.users}
        rowKey={(u) => u.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        emptyState={emptyState}
        selectable
        selectedKeys={selected}
        onSelectionChange={setSelected}
        sort={state.sort}
        onSortChange={state.setSort}
        skeletonRows={state.pageSize > 10 ? 10 : state.pageSize}
        footer={
          state.meta && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.meta.total}
              onPageChange={(p) => {
                setSelected([]);
                state.setPage(p);
              }}
              onPageSizeChange={state.setPageSize}
              disabled={state.isLoading}
            />
          )
        }
      />

      <InviteUserDrawer
        isOpen={inviteOpen}
        onClose={() => setInviteOpen(false)}
        onSuccess={state.reload}
        suggestedUserCode={`ZY-${String((state.meta?.total ?? 0) + 1).padStart(4, '0')}`}
      />
      <EditUserDrawer isOpen={!!editing} onClose={() => setEditing(null)} user={editing} onSuccess={state.reload} />
      <ChangeRoleDialog isOpen={!!changingRole} onClose={() => setChangingRole(null)} user={changingRole} onSuccess={state.reload} />
      {actions.dialog}
    </div>
  );
};

export default UsersPage;
