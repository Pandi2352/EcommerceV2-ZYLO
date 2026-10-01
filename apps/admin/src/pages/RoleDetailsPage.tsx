import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@shared/auth/AuthContext';
import { useQueryState } from '@shared/hooks/useQueryState';
import Tabs, { type TabItem } from '@shared/ui/Tabs';
import type { Role } from '../services/roles.service';
import { ROUTES } from '../routes/routePaths';
import { useRoleDetails } from '../features/roles/hooks/useRoleDetails';
import { usePermissionDraft } from '../features/roles/hooks/usePermissionDraft';
import { useRoleActions } from '../features/roles/hooks/useRoleActions';
import { useRoleUsers } from '../features/roles/hooks/useRoleUsers';
import { hasAllPermissions } from '../features/roles/lib/roleRules';
import RoleHeader from '../features/roles/components/RoleHeader';
import RoleOverviewTab from '../features/roles/components/RoleOverviewTab';
import RoleUsersTab from '../features/roles/components/RoleUsersTab';
import EditRoleDrawer from '../features/roles/components/EditRoleDrawer';
import PermissionEditor from '../features/roles/components/permission-editor/PermissionEditor';

type RoleTab = 'overview' | 'permissions' | 'users';

const RoleDetailsSkeleton: React.FC = () => (
  <div aria-busy="true" aria-label="Loading role">
    <div className="skeleton mb-3 h-3 w-64" />
    <div className="mb-4 rounded-lg border border-zinc-200 bg-white p-4">
      <div className="skeleton h-5 w-48" />
      <div className="skeleton mt-2 h-3 w-32" />
      <div className="skeleton mt-3 h-3 w-80" />
    </div>
    <div className="space-y-2">
      {[0, 1, 2].map((i) => (
        <div key={i} className="skeleton h-10 w-full rounded-lg" />
      ))}
    </div>
  </div>
);

export const RoleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { can } = useAuth();
  const params = useQueryState<'tab'>();
  const canSeeUsers = can('users.view');
  const requested = (params.get('tab') || 'permissions') as RoleTab;
  const tab: RoleTab = requested === 'users' && !canSeeUsers ? 'permissions' : requested;
  const setTab = (next: RoleTab) => params.set({ tab: next === 'permissions' ? null : next });

  const { role, setRole, catalog, isLoading, refreshRole } = useRoleDetails(id);
  const draft = usePermissionDraft(role, catalog, setRole);
  const users = useRoleUsers(id, canSeeUsers && tab === 'users');
  const [editing, setEditing] = useState(false);

  const actions = useRoleActions({
    onChanged: (updated: Role) => setRole(updated),
    onDeleted: () => navigate(ROUTES.ROLES),
  });

  if (isLoading && !role) return <RoleDetailsSkeleton />;
  if (!role) return null;

  const tabs: TabItem<RoleTab>[] = [
    { key: 'overview', label: 'Overview' },
    { key: 'permissions', label: 'Permissions', count: hasAllPermissions(role) ? undefined : draft.current.size },
    ...(canSeeUsers ? [{ key: 'users' as const, label: 'Users', count: role.userCount ?? 0 }] : []),
  ];

  return (
    <div>
      <RoleHeader
        role={role}
        onEdit={() => setEditing(true)}
        onToggleStatus={() => actions.askToggleStatus(role)}
        onDelete={() => actions.askDelete(role)}
      />

      <Tabs items={tabs} value={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && <RoleOverviewTab role={role} catalog={catalog} onOpenPermissions={() => setTab('permissions')} />}
      {tab === 'permissions' && <PermissionEditor role={role} catalog={catalog} draft={draft} />}
      {tab === 'users' && canSeeUsers && <RoleUsersTab role={role} state={users} onRoleChanged={refreshRole} />}

      <EditRoleDrawer role={editing ? role : null} onClose={() => setEditing(false)} onSaved={setRole} />
      {actions.dialog}
    </div>
  );
};

export default RoleDetailsPage;
