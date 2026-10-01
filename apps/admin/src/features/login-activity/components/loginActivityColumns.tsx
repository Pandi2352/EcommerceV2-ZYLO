import { Link } from 'react-router-dom';
import { CircleDot, Clock, Globe, Info, Laptop, Monitor, Smartphone, User } from 'lucide-react';
import Avatar from '@shared/ui/Avatar';
import StatusPill, { type StatusTone } from '@shared/ui/StatusPill';
import type { DataTableColumn } from '@shared/ui/DataTable';
import { formatDateTime } from '@shared/utils/format';
import type { LoginActivityItem, LoginActivityStatus } from '../../../services/loginActivity.service';
import LoginActivityRowActions, { type LoginActivityRowHandlers } from './LoginActivityRowActions';

const muted = <span className="text-zinc-400">—</span>;

const STATUS_TONE: Record<LoginActivityStatus, StatusTone> = {
  SUCCESS: 'success',
  FAILED: 'danger',
  BLOCKED: 'warning',
  LOGOUT: 'neutral',
};

/** Column definitions for the login activity table. */
export function loginActivityColumns(handlers: LoginActivityRowHandlers): DataTableColumn<LoginActivityItem>[] {
  return [
    {
      key: 'user',
      header: 'User',
      icon: <User />,
      render: (r) => (
        <div className="flex items-center gap-2">
          <Avatar name={r.userName} size="sm" />
          <div className="min-w-0 leading-tight">
            <div className="flex items-center gap-1.5">
              {r.userId ? (
                <Link to={`/users/${r.userId}`} className="font-medium text-zinc-900 hover:underline">
                  {r.userName}
                </Link>
              ) : (
                <span className="font-medium text-zinc-900">{r.userName}</span>
              )}
              {r.userCode && <span className="font-mono text-[11px] text-zinc-400">{r.userCode}</span>}
            </div>
            <div className="text-xs text-zinc-500">{r.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: 'event',
      header: 'Event',
      icon: <CircleDot />,
      render: (r) => <StatusPill tone={STATUS_TONE[r.status] ?? 'neutral'}>{r.statusLabel}</StatusPill>,
    },
    {
      key: 'reason',
      header: 'Reason',
      icon: <Info />,
      render: (r) =>
        r.failureReason ? (
          <span className="block max-w-[16rem] truncate text-zinc-600" title={r.failureReason}>
            {r.failureReason}
          </span>
        ) : (
          muted
        ),
    },
    {
      key: 'ip',
      header: 'IP address',
      icon: <Globe />,
      render: (r) => (r.ip ? <span className="font-mono text-xs text-zinc-600">{r.ip}</span> : muted),
    },
    {
      key: 'device',
      header: 'Device',
      icon: <Monitor />,
      render: (r) => {
        const DeviceIcon = r.device === 'Mobile' ? Smartphone : Laptop;
        return (
          <span className="inline-flex items-center gap-1.5 text-zinc-600" title={r.userAgent}>
            <DeviceIcon className="h-3.5 w-3.5 shrink-0 text-zinc-400" />
            {[r.browser, r.os].filter(Boolean).join(' · ') || '—'}
            {r.device && <span className="text-xs text-zinc-400">{r.device}</span>}
          </span>
        );
      },
    },
    {
      key: 'time',
      header: 'Time',
      icon: <Clock />,
      render: (r) => <span className="tabular-nums text-zinc-600">{formatDateTime(r.createdAt)}</span>,
    },
    {
      key: 'actions',
      sticky: 'right',
      header: 'Actions',
      align: 'right',
      render: (r) => <LoginActivityRowActions item={r} {...handlers} />,
    },
  ];
}
