import React, { useMemo, useState } from 'react';
import { Mail, UserPlus } from 'lucide-react';
import { useAuth } from '@shared/auth/AuthContext';
import PageHeader from '@shared/ui/PageHeader';
import DataTable from '@shared/ui/DataTable';
import Pagination from '@shared/ui/Pagination';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import Tabs, { type TabItem } from '@shared/ui/Tabs';
import { useInvitations, type InvitationTab } from '../features/invitations/hooks/useInvitations';
import { useInvitationActions } from '../features/invitations/hooks/useInvitationActions';
import { invitationsColumns } from '../features/invitations/components/invitationsColumns';
import InvitationsToolbar from '../features/invitations/components/InvitationsToolbar';
import InviteUserDrawer from '../components/users/InviteUserDrawer';

const TAB_LABELS: Record<InvitationTab, string> = {
  '': 'All',
  INVITED: 'Invited',
  EXPIRED: 'Expired',
  REVOKED: 'Revoked',
  REGISTERED: 'Registered',
};

export const InvitationsPage: React.FC = () => {
  const { can } = useAuth();
  const state = useInvitations();
  const actions = useInvitationActions(state.reload);
  const [inviteOpen, setInviteOpen] = useState(false);
  const canInvite = can('users.invite');

  const columns = useMemo(
    () => invitationsColumns({ onResend: actions.askResend, onRevoke: actions.askRevoke }),
    [actions.askResend, actions.askRevoke],
  );

  // The API reports counts for these tabs only (Expired and Revoked are combined), so the others show none.
  const { stats } = state;
  const tabs: TabItem<InvitationTab>[] = [
    { key: '', label: TAB_LABELS[''], count: stats?.totalCount },
    { key: 'INVITED', label: TAB_LABELS.INVITED, count: stats?.pendingCount },
    { key: 'EXPIRED', label: TAB_LABELS.EXPIRED },
    { key: 'REVOKED', label: TAB_LABELS.REVOKED },
    { key: 'REGISTERED', label: TAB_LABELS.REGISTERED, count: stats?.registeredCount },
  ];

  const inviteButton = canInvite && (
    <Button size="sm" variant="primary" leftIcon={<UserPlus />} onClick={() => setInviteOpen(true)}>
      Invite user
    </Button>
  );

  let emptyState: React.ReactNode;
  if (state.hasFilters) {
    emptyState = (
      <EmptyState
        icon={<Mail />}
        title="No invitations match these filters"
        description="Try a different search or role, or clear the filters."
        action={<Button size="sm" variant="outline" onClick={state.clearFilters}>Clear filters</Button>}
      />
    );
  } else if (state.status) {
    emptyState = (
      <EmptyState
        icon={<Mail />}
        title={`No ${TAB_LABELS[state.status].toLowerCase()} invitations`}
        description="Invitations move between tabs as they are accepted, expire or are revoked."
        action={<Button size="sm" variant="outline" onClick={() => state.setStatus('')}>View all invitations</Button>}
      />
    );
  } else {
    emptyState = (
      <EmptyState
        icon={<Mail />}
        title="No invitations sent yet"
        description="Invite a team member by email; their invitation is tracked here until they register."
        action={inviteButton}
      />
    );
  }

  return (
    <div>
      <PageHeader
        title="Invitations"
        count={state.meta?.total}
        description="Track pending invitations, resend expired links and see who has joined."
        actions={inviteButton}
      />

      <Tabs items={tabs} value={state.status} onChange={state.setStatus} className="mb-3" />

      <InvitationsToolbar state={state} />

      <DataTable
        columns={columns}
        rows={state.invitations}
        rowKey={(inv) => inv.id}
        isLoading={state.isLoading}
        error={state.error?.message}
        onRetry={state.reload}
        emptyState={emptyState}
        skeletonRows={state.pageSize > 10 ? 10 : state.pageSize}
        footer={
          state.meta && (
            <Pagination
              page={state.page}
              pageSize={state.pageSize}
              total={state.meta.total}
              onPageChange={state.setPage}
              onPageSizeChange={state.setPageSize}
              disabled={state.isLoading}
              itemLabel="invitations"
            />
          )
        }
      />

      <InviteUserDrawer isOpen={inviteOpen} onClose={() => setInviteOpen(false)} onSuccess={state.reload} />
      {actions.dialog}
    </div>
  );
};

export default InvitationsPage;
