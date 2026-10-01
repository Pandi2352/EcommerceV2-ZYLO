import React from 'react';
import { Link } from 'react-router-dom';
import { formatDateTime, humanizeConstant } from '@shared/utils/format';
import type { UserManagementOverview } from '../../../services/userOverview.service';

/** Latest user, role and invitation changes from the audit log. */
export const RecentChangesCard: React.FC<{ data: UserManagementOverview }> = ({ data }) => (
  <section className="rounded-lg border border-zinc-200 bg-white">
    <header className="flex items-start justify-between gap-2 px-4 pt-3.5">
      <div>
        <h2 className="text-sm font-semibold text-zinc-900">Recent changes</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Who changed users, roles and invitations</p>
      </div>
      <Link to="/audit-logs" className="text-xs font-medium text-zinc-500 hover:text-zinc-900">
        All logs
      </Link>
    </header>
    {data.recentChanges.length === 0 ? (
      <p className="px-4 py-6 text-[13px] text-zinc-500">No changes recorded yet.</p>
    ) : (
      <ol className="mt-2 divide-y divide-zinc-100">
        {data.recentChanges.map((change) => (
          <li key={change.id} className="px-4 py-2">
            <p className="text-[13px] text-zinc-900">
              {humanizeConstant(change.event)}
              {change.target && <span className="text-zinc-500"> · {change.target}</span>}
            </p>
            <p className="text-xs text-zinc-500">
              {change.actorEmail ? `by ${change.actorEmail} · ` : ''}
              <span className="tabular-nums">{formatDateTime(change.createdAt)}</span>
            </p>
          </li>
        ))}
      </ol>
    )}
  </section>
);

export default RecentChangesCard;
