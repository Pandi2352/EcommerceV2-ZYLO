import React, { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageHeader from '@shared/ui/PageHeader';
import Tabs from '@shared/ui/Tabs';
import Alert from '@shared/ui/Alert';
import Button from '@shared/ui/Button';
import { useQueryState } from '@shared/hooks/useQueryState';
import { ROUTES } from '../routes/routePaths';
import EditUserDrawer from '../components/users/EditUserDrawer';
import ChangeRoleDialog from '../components/users/ChangeRoleDialog';
import { useUserDetails } from '../features/users/details/hooks/useUserDetails';
import { useUserDetailActions } from '../features/users/details/hooks/useUserDetailActions';
import UserProfileHeader from '../features/users/details/components/UserProfileHeader';
import UserDetailsActions from '../features/users/details/components/UserDetailsActions';
import UserDetailsSkeleton from '../features/users/details/components/UserDetailsSkeleton';
import UserOverviewTab from '../features/users/details/components/UserOverviewTab';
import UserPermissionsTab from '../features/users/details/components/UserPermissionsTab';
import UserActivityTab from '../features/users/details/components/UserActivityTab';

type TabKey = 'overview' | 'permissions' | 'activity';
const TAB_KEYS: TabKey[] = ['overview', 'permissions', 'activity'];

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const details = useUserDetails(id);
  const { user, isSelf } = details;
  const actions = useUserDetailActions(user, details.reload);

  const params = useQueryState<'tab'>();
  const tabParam = params.get('tab') as TabKey;
  const tab: TabKey = TAB_KEYS.includes(tabParam) ? tabParam : 'overview';

  const [editOpen, setEditOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);


  if (!user) {
    return (
      <div>
        <PageHeader title="User profile" />
        {details.error ? (
          <Alert
            tone="error"
            title="Couldn't load this user"
            action={
              <div className="flex gap-2">
                <Button size="xs" variant="outline" onClick={details.reload}>Try again</Button>
                <Link to={ROUTES.USERS} className="self-center text-xs font-medium underline underline-offset-2">
                  Back to users
                </Link>
              </div>
            }
          >
            {details.error.message}
          </Alert>
        ) : (
          <UserDetailsSkeleton />
        )}
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="User profile"
        actions={
          <UserDetailsActions
            user={user}
            isSelf={isSelf}
            onEdit={() => setEditOpen(true)}
            onChangeRole={() => setRoleOpen(true)}
            onResetPassword={actions.askResetPassword}
            onToggleStatus={actions.askToggleStatus}
            onDelete={actions.askDelete}
          />
        }
      />

      <UserProfileHeader user={user} isSelf={isSelf} />

      <Tabs<TabKey>
        className="mb-4"
        value={tab}
        onChange={(next) => params.set({ tab: next === 'overview' ? null : next })}
        items={[
          { key: 'overview', label: 'Overview' },
          { key: 'permissions', label: 'Permissions', count: details.hasWildcard ? undefined : details.permissionCount },
          { key: 'activity', label: 'Activity', count: user.recentActivity?.length ?? 0 },
        ]}
      />

      {tab === 'overview' && <UserOverviewTab user={user} />}
      {tab === 'permissions' && (
        <UserPermissionsTab groups={details.permissionGroups} count={details.permissionCount} hasWildcard={details.hasWildcard} />
      )}
      {tab === 'activity' && <UserActivityTab activity={user.recentActivity ?? []} />}

      <EditUserDrawer isOpen={editOpen} onClose={() => setEditOpen(false)} user={user} onSuccess={details.reload} />
      <ChangeRoleDialog isOpen={roleOpen} onClose={() => setRoleOpen(false)} user={user} onSuccess={details.reload} />
      {actions.dialogs}
    </div>
  );
};

export default UserDetailsPage;
