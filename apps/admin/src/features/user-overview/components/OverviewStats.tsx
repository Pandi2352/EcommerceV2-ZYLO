import React from 'react';
import StatTile from '@shared/charts/StatTile';
import type { UserManagementOverview } from '../../../services/userOverview.service';

const RANGE_FOR_DAYS: Record<number, string> = { 7: '&range=7d', 30: '&range=30d', 90: '' };

/** Headline counts. Each tile links to the list where you can act on it. */
export const OverviewStats: React.FC<{ data: UserManagementOverview }> = ({ data }) => {
  const { users, invitations, signIns, roles, days } = data;
  const mfaRatio = users.total ? users.mfaEnabled / users.total : 0;
  const failed = signIns.failed + signIns.blocked;

  return (
    <div className="grid grid-cols-2 divide-zinc-200 overflow-hidden rounded-lg border border-zinc-200 bg-white sm:grid-cols-3 xl:grid-cols-6 xl:divide-x [&>*]:border-zinc-200 max-xl:[&>*]:border-b">
      <StatTile
        label="Staff users"
        value={users.total}
        context={`${users.active} active · ${users.inactive} inactive`}
        to="/users"
      />
      <StatTile
        label="2FA enabled"
        value={`${Math.round(mfaRatio * 100)}%`}
        meter={mfaRatio}
        context={`${users.mfaEnabled} of ${users.total} users`}
      />
      <StatTile
        label="Roles"
        value={roles.total}
        context={`${roles.active} active · ${roles.inactive} inactive`}
        to="/roles"
      />
      <StatTile
        label="Pending invitations"
        value={invitations.invited}
        context={invitations.expiringSoon > 0 ? `${invitations.expiringSoon} expire within 48h` : 'None expiring soon'}
        to="/invitations?status=INVITED"
      />
      <StatTile
        label="Locked accounts"
        value={users.locked}
        attention={users.locked > 0}
        context="Locked after repeated failed sign-ins"
        to="/login-activity?status=BLOCKED"
      />
      <StatTile
        label={`Failed sign-ins · ${days}d`}
        value={failed}
        attention={failed > 0 && failed >= signIns.success}
        context={`${signIns.success} successful sign-ins`}
        to={`/login-activity?status=FAILED${RANGE_FOR_DAYS[days]}`}
      />
    </div>
  );
};

export default OverviewStats;
