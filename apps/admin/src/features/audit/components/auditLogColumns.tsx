import { AppWindow, Clock, Globe, Monitor, User, Zap } from 'lucide-react';
import type { DataTableColumn } from '@shared/ui/DataTable';
import Avatar from '@shared/ui/Avatar';
import Badge, { type BadgeTone } from '@shared/ui/Badge';
import { formatDateTime, humanizeConstant } from '@shared/utils/format';
import type { AuditLogEntry } from '../../../services/audit.service';

const DANGER_EVENTS = new Set(['LOGIN_FAILED', 'LOGIN_BLOCKED_LOCKED', 'ACCOUNT_LOCKED', 'MFA_CHALLENGE_FAILED', 'REFRESH_TOKEN_REUSE']);
const WARNING_EVENTS = new Set(['MFA_DISABLED', 'PASSWORD_RESET_REQUESTED', 'MFA_BACKUP_CODE_USED']);
const SUCCESS_EVENTS = new Set(['LOGIN_SUCCESS', 'MFA_ENABLED', 'EMAIL_VERIFIED']);

function eventTone(event: string): BadgeTone {
  if (DANGER_EVENTS.has(event)) return 'danger';
  if (WARNING_EVENTS.has(event)) return 'warning';
  if (SUCCESS_EVENTS.has(event)) return 'success';
  return 'neutral';
}

const PORTAL_LABEL: Record<string, string> = { admin: 'Admin portal', customer: 'Storefront' };

const muted = <span className="text-zinc-400">—</span>;

/** Column definitions for the security log table. */
export const auditLogColumns: DataTableColumn<AuditLogEntry>[] = [
  {
    key: 'account',
    header: 'Account',
    icon: <User />,
    render: (row) =>
      row.email ? (
        <div className="flex items-center gap-2">
          <Avatar name={row.email} size="sm" />
          <div className="min-w-0 leading-tight">
            <div className="font-medium text-zinc-900">{row.email}</div>
            {row.role && <div className="text-xs text-zinc-500">{humanizeConstant(row.role)}</div>}
          </div>
        </div>
      ) : (
        muted
      ),
  },
  {
    key: 'event',
    header: 'Event',
    icon: <Zap />,
    render: (row) => <Badge tone={eventTone(row.event)}>{humanizeConstant(row.event)}</Badge>,
  },
  {
    key: 'portal',
    header: 'Portal',
    icon: <AppWindow />,
    render: (row) => (row.portal ? <span className="text-zinc-600">{PORTAL_LABEL[row.portal] ?? humanizeConstant(row.portal)}</span> : muted),
  },
  {
    key: 'ip',
    header: 'IP address',
    icon: <Globe />,
    render: (row) => (row.ip ? <span className="font-mono text-xs text-zinc-600">{row.ip}</span> : muted),
  },
  {
    key: 'device',
    header: 'Device',
    icon: <Monitor />,
    render: (row) =>
      row.userAgent ? (
        <span className="block max-w-[18rem] truncate text-xs text-zinc-500" title={row.userAgent}>
          {row.userAgent}
        </span>
      ) : (
        muted
      ),
  },
  {
    key: 'time',
    header: 'Time',
    icon: <Clock />,
    render: (row) => <span className="tabular-nums text-zinc-600">{formatDateTime(row.createdAt)}</span>,
  },
];
