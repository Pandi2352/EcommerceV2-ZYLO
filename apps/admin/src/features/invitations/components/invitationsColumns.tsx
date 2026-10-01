import { BadgeCheck, Calendar, CalendarClock, CircleDot, Hash, Link2, Repeat, Send, User, UserCog } from 'lucide-react';
import Avatar from '@shared/ui/Avatar';
import CopyButton from '@shared/ui/CopyButton';
import StatusPill, { type StatusTone } from '@shared/ui/StatusPill';
import type { DataTableColumn } from '@shared/ui/DataTable';
import { formatDateTime } from '@shared/utils/format';
import { cn } from '@shared/utils/cn';
import type { InvitationStatus, StaffInvitationItem } from '../../../services/invitations.service';
import { describeExpiry } from '../utils/relativeTime';
import InvitationRowActions, { type InvitationRowHandlers } from './InvitationRowActions';

const muted = <span className="text-zinc-400">—</span>;

export const INVITATION_STATUS: Record<InvitationStatus, { tone: StatusTone; label: string }> = {
  INVITED: { tone: 'info', label: 'Invited' },
  REGISTERED: { tone: 'success', label: 'Registered' },
  EXPIRED: { tone: 'warning', label: 'Expired' },
  REVOKED: { tone: 'neutral', label: 'Revoked' },
};

const date = (value?: string) =>
  value ? <span className="tabular-nums text-zinc-600">{formatDateTime(value)}</span> : muted;

/** Column definitions for the invitations table. */
export function invitationsColumns(handlers: InvitationRowHandlers): DataTableColumn<StaffInvitationItem>[] {
  return [
    {
      key: 'invitee',
      header: 'Invitee',
      icon: <User />,
      render: (inv) => {
        const name = `${inv.firstName} ${inv.lastName}`.trim();
        return (
          <div className="flex items-center gap-2">
            <Avatar name={name || inv.email} size="md" />
            <div className="min-w-0">
              <div className="truncate font-medium text-zinc-900">{name || inv.email}</div>
              <a
                href={`mailto:${inv.email}`}
                className="block truncate text-xs text-zinc-500 hover:text-zinc-900 hover:underline"
              >
                {inv.email}
              </a>
            </div>
          </div>
        );
      },
    },
    {
      key: 'userCode',
      header: 'User ID',
      icon: <Hash />,
      render: (inv) => (
        <div>
          {inv.userCode ? <span className="font-mono text-xs text-zinc-600">{inv.userCode}</span> : muted}
          {inv.designation && <div className="text-xs text-zinc-500">{inv.designation}</div>}
        </div>
      ),
    },
    { key: 'role', header: 'Role', icon: <UserCog />, render: (inv) => inv.roleName || muted },
    {
      key: 'status',
      header: 'Status',
      icon: <CircleDot />,
      render: (inv) => {
        const meta = INVITATION_STATUS[inv.status];
        return meta ? <StatusPill tone={meta.tone}>{meta.label}</StatusPill> : muted;
      },
    },
    {
      key: 'link',
      header: 'Invite link',
      icon: <Link2 />,
      // Only pending invitations have a usable link; it is hidden from staff without users.invite
      render: (inv) =>
        inv.inviteUrl ? (
          <div className="flex items-center gap-1">
            <span className="max-w-[11rem] truncate font-mono text-xs text-zinc-600" title={inv.inviteUrl}>
              {inv.inviteUrl.replace(/^https?:\/\//, '')}
            </span>
            <CopyButton value={inv.inviteUrl} label={`Copy invitation link for ${inv.email}`} successMessage="Invitation link copied" />
          </div>
        ) : (
          muted
        ),
    },
    {
      key: 'invitedBy',
      header: 'Invited by',
      icon: <Send />,
      render: (inv) =>
        inv.invitedByName ? (
          <div className="flex items-center gap-1.5">
            <Avatar name={inv.invitedByName} size="xs" />
            <span className="text-zinc-700">{inv.invitedByName}</span>
          </div>
        ) : (
          muted
        ),
    },
    { key: 'invitedAt', header: 'Invited at', icon: <Calendar />, render: (inv) => date(inv.createdAt) },
    {
      key: 'sent',
      header: 'Sent',
      icon: <Repeat />,
      render: (inv) => (
        <span
          className="tabular-nums text-zinc-600"
          title={inv.lastSentAt ? `Last sent ${formatDateTime(inv.lastSentAt)}` : undefined}
        >
          {inv.sentCount === 1 ? '1 time' : `${inv.sentCount ?? 0} times`}
        </span>
      ),
    },
    {
      key: 'expires',
      header: 'Expires',
      icon: <CalendarClock />,
      render: (inv) => {
        if (inv.status !== 'INVITED' && inv.status !== 'EXPIRED') return muted;
        const { label, expired } = describeExpiry(inv.expiresAt);
        return (
          <span title={formatDateTime(inv.expiresAt)} className={cn('tabular-nums', expired ? 'text-amber-700' : 'text-zinc-600')}>
            {label}
          </span>
        );
      },
    },
    { key: 'registeredAt', header: 'Registered at', icon: <BadgeCheck />, render: (inv) => date(inv.registeredAt) },
    {
      key: 'actions',
      sticky: 'right',
      header: 'Actions',
      align: 'right',
      render: (inv) => <InvitationRowActions invitation={inv} {...handlers} />,
    },
  ];
}
