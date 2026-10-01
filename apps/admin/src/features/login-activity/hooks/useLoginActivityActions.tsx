import { useCallback, useState } from 'react';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { loginActivityService, type LoginActivityItem } from '../../../services/loginActivity.service';

/** Copy-IP and revoke-sessions actions, plus the confirmation dialog they need. */
export function useLoginActivityActions(onChanged: () => void) {
  const [revoking, setRevoking] = useState<LoginActivityItem | null>(null);
  const [isBusy, setIsBusy] = useState(false);

  const copyIp = useCallback((ip: string) => {
    navigator.clipboard
      .writeText(ip)
      .then(() => toast.success(`${ip} copied to clipboard.`))
      .catch(() => toast.error('Could not copy the IP address.'));
  }, []);

  const askRevokeSessions = useCallback((item: LoginActivityItem) => setRevoking(item), []);

  const revoke = async () => {
    if (!revoking?.userId) return;
    try {
      setIsBusy(true);
      await loginActivityService.revokeUserSessions(revoking.userId);
      toast.success('They will have to sign in again on every device.', {
        title: `Sessions revoked for "${revoking.userName}"`,
      });
      setRevoking(null);
      onChanged();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsBusy(false);
    }
  };

  const dialog = (
    <ConfirmDialog
      isOpen={!!revoking}
      onClose={() => setRevoking(null)}
      onConfirm={revoke}
      isLoading={isBusy}
      tone="warning"
      title="Revoke all sessions?"
      confirmText="Revoke sessions"
      description={
        <span>
          <strong className="font-medium text-zinc-900">{revoking?.userName}</strong> ({revoking?.email}) will be signed out
          everywhere. Their refresh tokens are invalidated immediately.
        </span>
      }
    />
  );

  return { copyIp, askRevokeSessions, dialog };
}
