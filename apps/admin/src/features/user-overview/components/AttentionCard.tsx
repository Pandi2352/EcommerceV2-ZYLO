import React from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, Clock, Lock, ShieldOff } from 'lucide-react';
import Avatar from '@shared/ui/Avatar';
import type { UserManagementOverview } from '../../../services/userOverview.service';

interface Row {
  key: string;
  icon: React.ReactNode;
  name: string;
  detail: string;
  to: string;
}

const until = (iso: string) =>
  new Date(iso).toLocaleString(undefined, { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' });

/** Accounts and invitations someone should act on now. */
export const AttentionCard: React.FC<{ data: UserManagementOverview }> = ({ data }) => {
  const { locked, privilegedWithout2fa, expiringInvitations } = data.attention;
  const rows: Row[] = [
    ...locked.map((u) => ({ key: `l-${u.id}`, icon: <Lock className="text-rose-500" />, name: u.name, detail: `Locked until ${until(u.lockUntil)}`, to: `/users/${u.id}` })),
    ...privilegedWithout2fa.map((u) => ({ key: `m-${u.id}`, icon: <ShieldOff className="text-amber-500" />, name: u.name, detail: `${u.roleName} without 2FA`, to: `/users/${u.id}` })),
    ...expiringInvitations.map((i) => ({ key: `i-${i.id}`, icon: <Clock className="text-sky-500" />, name: i.name, detail: `Invitation expires ${until(i.expiresAt)}`, to: '/invitations?status=INVITED' })),
  ];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white">
      <header className="px-4 pt-3.5">
        <h2 className="text-sm font-semibold text-zinc-900">Needs attention</h2>
        <p className="mt-0.5 text-xs text-zinc-500">Locked accounts, admins without 2FA, invitations about to expire</p>
      </header>
      {rows.length === 0 ? (
        <div className="flex items-center gap-2 px-4 py-6 text-[13px] text-zinc-600">
          <CheckCircle2 className="h-4 w-4 text-emerald-500" /> Nothing needs attention right now.
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-zinc-100">
          {rows.map((row) => (
            <li key={row.key}>
              <Link to={row.to} className="flex items-center gap-2.5 px-4 py-2 transition-colors hover:bg-zinc-50">
                <Avatar name={row.name} size="sm" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13px] font-medium text-zinc-900">{row.name}</span>
                  <span className="block truncate text-xs text-zinc-500">{row.detail}</span>
                </span>
                <span className="flex shrink-0 [&>svg]:h-3.5 [&>svg]:w-3.5">{row.icon}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
};

export default AttentionCard;
