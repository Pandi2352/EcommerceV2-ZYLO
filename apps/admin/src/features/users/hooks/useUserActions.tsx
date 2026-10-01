import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { staffUsersService, type StaffUserItem } from '../../../services/staffUsers.service';

type PendingAction = { kind: 'status' | 'delete' | 'reset'; user: StaffUserItem } | null;

/**
 * Suspend / reactivate, delete and password-reset actions for a staff user,
 * with their confirmation dialog and result toasts. Render `dialog` once.
 */
export function useUserActions(onChanged: () => void) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [pending, setPending] = useState<PendingAction>(null);
  const [isRunning, setIsRunning] = useState(false);

  const setStatus = async (user: StaffUserItem, active: boolean, { withUndo }: { withUndo: boolean }) => {
    if (active) await staffUsersService.activate(user.id);
    else await staffUsersService.deactivate(user.id);
    onChanged();
    toast.success(active ? 'Console access restored.' : 'All sessions were signed out.', {
      title: `${user.name} ${active ? 'reactivated' : 'suspended'}`,
      actions: withUndo
        ? [{ label: 'Undo', onClick: () => void setStatus(user, !active, { withUndo: false }).catch((e) => toast.error(extractErrorMessage(e))) }]
        : undefined,
    });
  };

  const confirm = async () => {
    if (!pending) return;
    const { kind, user } = pending;
    setIsRunning(true);
    try {
      if (kind === 'status') {
        await setStatus(user, user.status !== 'ACTIVE', { withUndo: true });
      } else if (kind === 'delete') {
        await staffUsersService.softDelete(user.id);
        onChanged();
        toast.success('Their sessions were revoked and they can no longer sign in.', { title: `${user.name} deleted` });
      } else {
        await staffUsersService.resetPassword(user.id);
        toast.success(`A reset link was sent to ${user.email}.`, {
          title: 'Password reset sent',
          // No "View profile" when the user is already looking at it
          actions:
            pathname === `/users/${user.id}` ? undefined : [{ label: 'View profile', onClick: () => navigate(`/users/${user.id}`) }],
        });
      }
      setPending(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const user = pending?.user;
  const suspending = pending?.kind === 'status' && user?.status === 'ACTIVE';

  const copy = {
    status: suspending
      ? { title: `Suspend ${user?.name}?`, body: 'They will be signed out everywhere and blocked from the console until reactivated.', cta: 'Suspend', tone: 'warning' as const }
      : { title: `Reactivate ${user?.name}?`, body: 'They will be able to sign in to the console again.', cta: 'Reactivate', tone: 'primary' as const },
    delete: { title: `Delete ${user?.name}?`, body: `${user?.email} will lose console access and all sessions will be revoked. This can't be undone from the console.`, cta: 'Delete user', tone: 'danger' as const },
    reset: { title: 'Send password reset?', body: `We'll email a reset link to ${user?.email}. Their current password keeps working until they set a new one.`, cta: 'Send link', tone: 'primary' as const },
  }[pending?.kind ?? 'reset'];

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
    askToggleStatus: (u: StaffUserItem) => setPending({ kind: 'status', user: u }),
    askDelete: (u: StaffUserItem) => setPending({ kind: 'delete', user: u }),
    askResetPassword: (u: StaffUserItem) => setPending({ kind: 'reset', user: u }),
  };
}
