import React from 'react';
import { Activity, Clock, Globe } from 'lucide-react';
import DataTable, { type DataTableColumn } from '@shared/ui/DataTable';
import EmptyState from '@shared/ui/EmptyState';
import { formatDateTime, humanizeConstant } from '@shared/utils/format';
import type { StaffUserDetail } from '../../../../services/staffUsers.service';

type ActivityRow = StaffUserDetail['recentActivity'][number];

const columns: DataTableColumn<ActivityRow>[] = [
  {
    key: 'event',
    header: 'Event',
    icon: <Activity />,
    render: (a) => <span className="font-medium text-zinc-900">{humanizeConstant(a.event)}</span>,
  },
  {
    key: 'ip',
    header: 'IP address',
    icon: <Globe />,
    render: (a) => (a.ip ? <span className="font-mono text-xs text-zinc-600">{a.ip}</span> : <span className="text-zinc-400">—</span>),
  },
  {
    key: 'time',
    header: 'Time',
    icon: <Clock />,
    align: 'right',
    render: (a) => <span className="tabular-nums text-zinc-600">{formatDateTime(a.createdAt)}</span>,
  },
];

/** The most recent audit events recorded for this user. */
export const UserActivityTab: React.FC<{ activity: ActivityRow[] }> = ({ activity }) => (
  <div>
    <p className="mb-2 text-xs text-zinc-500">Most recent security and account events for this user.</p>
    <DataTable
      columns={columns}
      rows={activity}
      rowKey={(a) => a.id}
      emptyState={
        <EmptyState
          icon={<Activity />}
          title="No activity yet"
          description="Sign-ins and account changes appear here once this user starts using the console."
        />
      }
    />
  </div>
);

export default UserActivityTab;
