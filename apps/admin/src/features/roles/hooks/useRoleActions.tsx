import { useState } from 'react';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { rolesService, type Role } from '../../../services/roles.service';

type PendingAction = { kind: 'status' | 'delete'; role: Role } | null;

export interface RoleActionCallbacks {
  /** Called with the updated role after activate / deactivate */
  onChanged: (role: Role) => void;
  onDeleted: (role: Role) => void;
}

/**
 * Activate / deactivate and delete for a role, with the confirmation dialog
 * and result toasts. Render `dialog` once.
 */
export function useRoleActions({ onChanged, onDeleted }: RoleActionCallbacks) {
  const [pending, setPending] = useState<PendingAction>(null);
  const [isRunning, setIsRunning] = useState(false);

  const setStatus = async (role: Role, active: boolean, { withUndo }: { withUndo: boolean }) => {
    const updated = await rolesService.updateRole(role.id, { status: active ? 'ACTIVE' : 'INACTIVE' });
    onChanged(updated);
    toast.success(active ? 'It can be assigned to staff again.' : 'It can no longer be assigned to staff.', {
      title: `"${role.name}" ${active ? 'activated' : 'deactivated'}`,
      actions: withUndo
        ? [{ label: 'Undo', onClick: () => void setStatus(updated, !active, { withUndo: false }).catch((e) => toast.error(extractErrorMessage(e))) }]
        : undefined,
    });
  };

  const confirm = async () => {
    if (!pending) return;
    const { kind, role } = pending;
    setIsRunning(true);
    try {
      if (kind === 'status') {
        await setStatus(role, role.status !== 'ACTIVE', { withUndo: true });
      } else {
        await rolesService.deleteRole(role.id);
        toast.success('The role and its permission set were removed.', { title: `"${role.name}" deleted` });
        onDeleted(role);
      }
      setPending(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsRunning(false);
    }
  };

  const role = pending?.role;
  const deactivating = pending?.kind === 'status' && role?.status === 'ACTIVE';

  const copy =
    pending?.kind === 'delete'
      ? { title: `Delete "${role?.name}"?`, body: 'This role will be permanently removed. This action cannot be undone.', cta: 'Delete role', tone: 'danger' as const }
      : deactivating
        ? { title: `Deactivate "${role?.name}"?`, body: 'It can no longer be assigned to staff members. You can activate it again at any time.', cta: 'Deactivate', tone: 'warning' as const }
        : { title: `Activate "${role?.name}"?`, body: 'The role can be assigned to staff members again.', cta: 'Activate', tone: 'primary' as const };

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
    askToggleStatus: (r: Role) => setPending({ kind: 'status', role: r }),
    askDelete: (r: Role) => setPending({ kind: 'delete', role: r }),
  };
}
