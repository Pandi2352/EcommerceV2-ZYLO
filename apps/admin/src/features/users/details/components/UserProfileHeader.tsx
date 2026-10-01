import React from 'react';
import { ShieldCheck } from 'lucide-react';
import Avatar from '@shared/ui/Avatar';
import Badge from '@shared/ui/Badge';
import StatusPill from '@shared/ui/StatusPill';
import type { StaffUserDetail } from '../../../../services/staffUsers.service';

export interface UserProfileHeaderProps {
  user: StaffUserDetail;
  isSelf: boolean;
}

/** Compact identity strip: avatar, name, email and the account's state markers. */
export const UserProfileHeader: React.FC<UserProfileHeaderProps> = ({ user, isSelf }) => {
  const active = user.status === 'ACTIVE';

  return (
    <div className="mb-4 flex items-center gap-3 rounded-lg border border-zinc-200 bg-white p-4">
      <Avatar name={user.name} size="lg" />
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="truncate text-[15px] font-semibold text-zinc-900">{user.name}</span>
          {isSelf && <Badge>You</Badge>}
          {user.userCode && <span className="font-mono text-xs text-zinc-500">{user.userCode}</span>}
        </div>
        <div className="mt-0.5 flex min-w-0 flex-wrap items-center gap-x-2 text-[13px] text-zinc-500">
          <a href={`mailto:${user.email}`} className="truncate underline decoration-zinc-300 underline-offset-2 hover:text-zinc-900">
            {user.email}
          </a>
          {user.designation && (
            <>
              <span aria-hidden="true" className="text-zinc-300">·</span>
              <span className="truncate">{user.designation}</span>
            </>
          )}
        </div>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <StatusPill tone={active ? 'success' : 'danger'}>{active ? 'Active' : 'Inactive'}</StatusPill>
          {user.isLocked && <StatusPill tone="warning">Locked</StatusPill>}
          {user.mfaEnabled ? (
            <Badge tone="highlight">
              <ShieldCheck className="h-3 w-3" />
              2FA enabled
            </Badge>
          ) : (
            <Badge>2FA disabled</Badge>
          )}
          {user.roleName && <Badge>{user.roleName}</Badge>}
        </div>
      </div>
    </div>
  );
};

export default UserProfileHeader;
