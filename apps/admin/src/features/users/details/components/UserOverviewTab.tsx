import React from 'react';
import { Link } from 'react-router-dom';
import Badge from '@shared/ui/Badge';
import { formatDateTime, humanizeConstant } from '@shared/utils/format';
import type { StaffUserDetail } from '../../../../services/staffUsers.service';

const muted = <span className="text-zinc-400">—</span>;

const Field: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="flex min-w-0 flex-col gap-0.5 border-b border-zinc-100 py-2.5 sm:flex-row sm:items-baseline sm:gap-4">
    <dt className="w-32 shrink-0 text-xs text-zinc-500">{label}</dt>
    <dd className="min-w-0 text-[13px] text-zinc-800">{children}</dd>
  </div>
);

/** Profile attributes as a two-column definition list. */
export const UserOverviewTab: React.FC<{ user: StaffUserDetail }> = ({ user }) => {
  const roles = user.roles ?? [];

  return (
    <section className="rounded-lg border border-zinc-200 bg-white px-4 pb-1 pt-3">
      <h2 className="text-sm font-semibold text-zinc-900">Details</h2>
      <dl className="grid grid-cols-1 gap-x-8 md:grid-cols-2">
        <Field label="Full name">{user.name}</Field>
        <Field label="User ID">{user.userCode ? <span className="font-mono text-xs">{user.userCode}</span> : muted}</Field>
        <Field label="Email">
          <a href={`mailto:${user.email}`} className="break-all hover:underline">
            {user.email}
          </a>
        </Field>
        <Field label="Designation">{user.designation || muted}</Field>
        <Field label={roles.length > 1 ? 'Roles' : 'Role'}>
          {roles.length === 0 ? (
            user.roleName || muted
          ) : (
            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
              {roles.map((role) => (
                <span key={role.id} className="inline-flex items-center gap-1.5">
                  <Link to={`/roles/${role.id}`} className="font-medium text-zinc-900 hover:underline">
                    {role.name}
                  </Link>
                  {role.isSystem && <Badge>System</Badge>}
                </span>
              ))}
            </span>
          )}
        </Field>
        <Field label="Account type">{user.accountType ? humanizeConstant(user.accountType) : muted}</Field>
        <Field label="Joined">
          <span className="tabular-nums">{formatDateTime(user.createdAt)}</span>
        </Field>
        <Field label="Last login">
          {user.lastLoginAt ? <span className="tabular-nums">{formatDateTime(user.lastLoginAt)}</span> : <span className="text-zinc-400">Never</span>}
        </Field>
        <Field label="Two-factor auth">{user.mfaEnabled ? 'Enabled' : 'Not set up'}</Field>
        <Field label="Sign-in">{user.isLocked ? 'Locked' : 'Not locked'}</Field>
      </dl>
    </section>
  );
};

export default UserOverviewTab;
