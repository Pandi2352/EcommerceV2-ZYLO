import { useState } from 'react';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { invitationsService, type StaffInvitationItem } from '../../../services/invitations.service';

type PendingAction = { kind: 'resend' | 'revoke'; invitation: StaffInvitationItem } | null;

/**
 * Resend and revoke for an invitation, with their confirmation dialog and
 * result toasts. Render `dialog` once.
 */
export function useInvitationActions(onChanged: () => void) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [isRunning, setIsRunning] = useState(false);

  const confirm = async () => {
    if (!pending) return;
    const { kind, invitation } = pending;
    setIsRunning(true);
    try {
      if (kind === 'resend') {
        await invitationsService.resendInvitation(invitation.id);
        toast.success(`A new link was emailed to ${invitation.email}. The previous link no longer works.`, {
          title: 'Invitation resent',
        });
      } else {
        await invitationsService.revokeInvitation(invitation.id);
        toast.success(`${invitation.email} can no longer use their invitation link.`, {
          title: 'Invitation revoked',
        });
      }
      setPending(null);
      onChanged();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const email = pending?.invitation.email;

  const copy =
    pending?.kind === 'revoke'
      ? {
          title: 'Revoke invitation?',
          body: `${email} will no longer be able to create an account with their invitation link. You can resend it later.`,
          cta: 'Revoke invitation',
          tone: 'danger' as const,
        }
      : {
          title: 'Resend invitation?',
          body: `We'll email a new link to ${email}, valid for 7 days. The previous link stops working immediately.`,
          cta: 'Resend invitation',
          tone: 'primary' as const,
        };

  const dialog = (
    <ConfirmDialog
      isOpen={pending !== null}
      onClose={() => setPending(null)}
      onConfirm={confirm}
      isLoading={isRunning}
      title={copy.title}
      description={copy.body}
      confirmText={copy.cta}
      tone={copy.tone}
    />
  );

  return {
    dialog,
    askResend: (invitation: StaffInvitationItem) => setPending({ kind: 'resend', invitation }),
    askRevoke: (invitation: StaffInvitationItem) => setPending({ kind: 'revoke', invitation }),
  };
}
