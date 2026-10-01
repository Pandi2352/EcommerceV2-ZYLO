import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowUpRight, Ban, RotateCw } from 'lucide-react';
import Button from '@shared/ui/Button';
import { useAuth } from '@shared/auth/AuthContext';
import type { StaffInvitationItem } from '../../../services/invitations.service';

export interface InvitationRowHandlers {
  onResend: (invitation: StaffInvitationItem) => void;
  onRevoke: (invitation: StaffInvitationItem) => void;
}

/**
 * Actions that make sense for the invitation's status:
 * Invited / Expired → Resend, Revoke · Revoked → Resend · Registered → View user.
 */
export const InvitationRowActions: React.FC<{ invitation: StaffInvitationItem } & InvitationRowHandlers> = ({
  invitation,
  onResend,
  onRevoke,
}) => {
  const navigate = useNavigate();
  const { can } = useAuth();
  const { status, userId } = invitation;
  const canInvite = can('users.invite');

  const showResend = canInvite && status !== 'REGISTERED';
  const showRevoke = canInvite && (status === 'INVITED' || status === 'EXPIRED');
  const showView = status === 'REGISTERED' && !!userId && can('users.view');

  if (!showResend && !showRevoke && !showView) return <span className="text-zinc-400">—</span>;

  return (
    <div className="flex items-center justify-end gap-1.5">
      {showResend && (
        <Button size="xs" variant="outline" leftIcon={<RotateCw />} onClick={() => onResend(invitation)}>
          Resend
        </Button>
      )}
      {showRevoke && (
        <Button size="xs" variant="outline" leftIcon={<Ban />} onClick={() => onRevoke(invitation)}>
          Revoke
        </Button>
      )}
      {showView && (
        <Button size="xs" variant="outline" rightIcon={<ArrowUpRight />} onClick={() => navigate(`/users/${userId}`)}>
          View user
        </Button>
      )}
    </div>
  );
};

export default InvitationRowActions;
