import type { DataTableColumn } from '@shared/ui/DataTable';
import type { AuditLogEntry } from '../../../services/audit.service';
import Badge, { type BadgeTone } from '@shared/ui/Badge';
import { formatDateTime, humanizeConstant } from '@shared/utils/format';

const DANGER_EVENTS = new Set(['LOGIN_FAILED', 'LOGIN_BLOCKED_LOCKED', 'ACCOUNT_LOCKED', 'MFA_CHALLENGE_FAILED', 'REFRESH_TOKEN_REUSE']);
const WARNING_EVENTS = new Set(['MFA_DISABLED', 'PASSWORD_RESET_REQUESTED', 'MFA_BACKUP_CODE_USED']);
const SUCCESS_EVENTS = new Set(['LOGIN_SUCCESS', 'MFA_ENABLED', 'EMAIL_VERIFIED']);

function eventTone(event: string): BadgeTone {
  if (DANGER_EVENTS.has(event)) return 'danger';
  if (WARNING_EVENTS.has(event)) return 'warning';
  if (SUCCESS_EVENTS.has(event)) return 'success';
  return 'neutral';
}

export const auditLogColumns: DataTableColumn<AuditLogEntry>[] = [
  {
    key: 'time',
    header: 'Time',
    className: 'whitespace-nowrap',
    render: (row) => formatDateTime(row.createdAt),
  },
  {
    key: 'event',
    header: 'Event',
    render: (row) => <Badge tone={eventTone(row.event)}>{humanizeConstant(row.event)}</Badge>,
  },
  {
    key: 'account',
    header: 'Account',
    render: (row) => (
      <div className="min-w-0">
        <p className="font-semibold text-slate-800 break-all">{row.email ?? '—'}</p>
        {row.role && <p className="text-[11px] text-slate-400">{humanizeConstant(row.role)}</p>}
      </div>
    ),
  },
  {
    key: 'portal',
    header: 'Portal',
    render: (row) => (row.portal ? humanizeConstant(row.portal) : '—'),
  },
  {
    key: 'source',
    header: 'IP / Device',
    render: (row) => (
      <div className="max-w-xs">
        <p className="font-mono text-[11px] text-slate-700">{row.ip ?? '—'}</p>
        {row.userAgent && <p className="text-[11px] text-slate-400 truncate" title={row.userAgent}>{row.userAgent}</p>}
      </div>
    ),
  },
];
