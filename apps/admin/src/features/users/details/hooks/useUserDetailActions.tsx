import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { staffUsersService, type StaffUserDetail } from '../../../../services/staffUsers.service';
import { ROUTES } from '../../../../routes/routePaths';
import { useUserActions } from '../../hooks/useUserActions';

/**
 * Profile-page actions. Suspend / reactivate and password reset reuse the list's
 * `useUserActions`; delete is handled here because it must leave the deleted profile.
 */
export function useUserDetailActions(user: StaffUserDetail | null, reload: () => void) {
  const navigate = useNavigate();
  const shared = useUserActions(reload);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const confirmDelete = async () => {
    if (!user) return;
    setIsDeleting(true);
    try {
      await staffUsersService.softDelete(user.id);
      toast.success('Their sessions were revoked and they can no longer sign in.', { title: `${user.name} deleted` });
      setDeleteOpen(false);
      navigate(ROUTES.USERS);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  const dialogs = (
    <>
      {shared.dialog}
      <ConfirmDialog
        isOpen={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={confirmDelete}
        isLoading={isDeleting}
        title={`Delete ${user?.name ?? 'user'}?`}
        description={`${user?.email ?? 'This user'} will lose console access and all sessions will be revoked. This can't be undone from the console.`}
        confirmText="Delete user"
        tone="danger"
      />
    </>
  );

  return {
    dialogs,
    askToggleStatus: () => user && shared.askToggleStatus(user),
    askResetPassword: () => user && shared.askResetPassword(user),
    askDelete: () => setDeleteOpen(true),
  };
}
