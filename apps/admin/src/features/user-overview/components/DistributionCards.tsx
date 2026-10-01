import React from 'react';
import ChartCard, { ChartTable } from '@shared/charts/ChartCard';
import BarList from '@shared/charts/BarList';
import StackedBar from '@shared/charts/StackedBar';
import type { UserManagementOverview } from '../../../services/userOverview.service';

/** How staff are spread across roles. */
export const RoleDistributionCard: React.FC<{ data: UserManagementOverview }> = ({ data }) => {
  const roles = data.roles.distribution;
  return (
    <ChartCard
      title="Which roles hold the most users?"
      subtitle={`${data.users.total} staff across ${data.roles.total} roles`}
      table={<ChartTable columns={['Role', 'Users']} rows={roles.map((r) => [r.name, r.userCount])} />}
    >
      <BarList
        items={roles.map((r) => ({
          key: r.id,
          label: r.name,
          value: r.userCount,
          to: `/roles/${r.id}`,
          note: r.status === 'ACTIVE' ? undefined : 'Inactive',
        }))}
        emptyText="No roles yet."
      />
    </ChartCard>
  );
};

/** Invitation outcomes as one part-to-whole bar. */
export const InvitationsCard: React.FC<{ data: UserManagementOverview }> = ({ data }) => {
  const inv = data.invitations;
  const segments = [
    { key: 'registered', label: 'Registered', value: inv.registered, color: 'var(--viz-1)', to: '/invitations?status=REGISTERED' },
    { key: 'invited', label: 'Pending', value: inv.invited, color: 'var(--viz-2)', to: '/invitations?status=INVITED' },
    { key: 'expired', label: 'Expired', value: inv.expired, color: 'var(--viz-3)', to: '/invitations?status=EXPIRED' },
    { key: 'revoked', label: 'Revoked', value: inv.revoked, color: 'var(--viz-4)', to: '/invitations?status=REVOKED' },
  ];
  const total = segments.reduce((sum, s) => sum + s.value, 0);

  return (
    <ChartCard
      title="How do invitations end up?"
      subtitle={`${total} invitations in total · ${inv.sentInPeriod} sent in the last ${data.days} days`}
      table={<ChartTable columns={['Status', 'Invitations']} rows={segments.map((s) => [s.label, s.value])} />}
    >
      {total === 0 ? (
        <p className="py-6 text-center text-xs text-zinc-500">No invitations sent yet.</p>
      ) : (
        <StackedBar segments={segments} ariaLabel={`Invitations: ${segments.map((s) => `${s.value} ${s.label.toLowerCase()}`).join(', ')}`} />
      )}
      {inv.expiringSoon > 0 && (
        <p className="mt-3 rounded-md bg-amber-50 px-2.5 py-1.5 text-xs text-amber-800">
          {inv.expiringSoon} pending {inv.expiringSoon === 1 ? 'invitation expires' : 'invitations expire'} within 48 hours.
        </p>
      )}
    </ChartCard>
  );
};
