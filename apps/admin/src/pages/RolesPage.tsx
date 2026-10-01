import React, { useMemo, useState } from 'react';
import { Plus, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import PageHeader from '@shared/ui/PageHeader';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import type { Role } from '../services/roles.service';
import { useRolesList } from '../features/roles/hooks/useRolesList';
import { useRoleActions } from '../features/roles/hooks/useRoleActions';
import { rolesColumns } from '../features/roles/components/rolesColumns';
import RolesToolbar from '../features/roles/components/RolesToolbar';
import EditRoleDrawer from '../features/roles/components/EditRoleDrawer';
import CreateRoleDrawer from '../components/roles/CreateRoleDrawer';

export const RolesPage: React.FC = () => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const state = useRolesList();
  const actions = useRoleActions({ onChanged: state.reload, onDeleted: state.reload });

  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<Role | null>(null);

  const columns = useMemo(
    () => rolesColumns({ onEdit: setEditing, onToggleStatus: actions.askToggleStatus, onDelete: actions.askDelete }),
    [actions.askToggleStatus, actions.askDelete],
  );

  const emptyState = state.hasFilters ? (
    <EmptyState
      icon={<Shield />}
      title="No roles match these filters"
      description="Try a different search, or clear the filters to see every role."
      action={<Button size="sm" variant="outline" onClick={state.clearFilters}>Clear filters</Button>}
    />
  ) : (
    <EmptyState
      icon={<Shield />}
      title="No roles yet"
      description="Roles group the permissions a team member gets in the console."
      action={can('roles.create') && <Button size="sm" variant="primary" leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>Create role</Button>}
    />
  );

  return (
    <div>
      <PageHeader
        title="Roles"
        count={state.total}
        description="Roles decide what each team member can see and change in the console."
        actions={
          can('roles.create') && (
            <Button size="sm" variant="primary" leftIcon={<Plus />} onClick={() => setCreateOpen(true)}>
              Create role
            </Button>
          )
        }
      />

      <RolesToolbar state={state} />

      <DataTable
        columns={columns}
        rows={state.rows}
        rowKey={(r) => r.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        emptyState={emptyState}
        onRowClick={(r) => navigate(`/roles/${r.id}`)}
        skeletonRows={6}
        footer={
          // Shown once there is more than the smallest page size, so the size can always be changed back
          state.filteredTotal > 10 && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.filteredTotal}
              onPageChange={state.setPage}
              onPageSizeChange={state.setPageSize}
              itemLabel="roles"
            />
          )
        }
      />

      <CreateRoleDrawer
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onSuccess={state.reload}
        existingRoles={state.all}
      />
      <EditRoleDrawer role={editing} onClose={() => setEditing(null)} onSaved={state.reload} />
      {actions.dialog}
    </div>
  );
};

export default RolesPage;
