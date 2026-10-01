import React, { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate, useLocation } from 'react-router-dom';
import { AlertTriangle, Shield, X } from 'lucide-react';
import Button from '@shared/ui/Button';
import Dropdown from '@shared/ui/Dropdown';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { staffUsersService, type StaffUserItem, type StaffUserDetail } from '../../services/staffUsers.service';
import { useRoleOptions } from '../../features/roles/hooks/useRoleOptions';

export interface ChangeRoleDialogProps {
  isOpen: boolean;
  onClose: () => void;
  user: StaffUserItem | StaffUserDetail | null;
  onSuccess: () => void;
}

/** Compact modal to move a staff user to another (active) role. */
export const ChangeRoleDialog: React.FC<ChangeRoleDialogProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { roles, options, isLoading, error } = useRoleOptions({ activeOnly: true });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const currentId = user?.roleIds?.[0] ?? '';

  // The picked role resets to the user's current role every time the dialog opens
  const session = isOpen && user ? user.id : null;
  const [picked, setPicked] = useState<{ session: string | null; roleId: string }>({ session: null, roleId: '' });
  if (picked.session !== session) setPicked({ session, roleId: currentId });
  const roleId = picked.session === session ? picked.roleId : currentId;
  const setRoleId = (next: string) => setPicked({ session, roleId: next });

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => e.key === 'Escape' && !isSubmitting && onClose();
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  const roleOptions = useMemo(
    () => options.map((o) => (o.value === currentId ? { ...o, description: 'Current role' } : o)),
    [options, currentId],
  );

  if (!isOpen || !user) return null;

  const target = roles.find((r) => r.id === roleId);
  const currentName = roles.find((r) => r.id === currentId)?.name ?? user.roleName;
  const unchanged = !roleId || roleId === currentId;
  const profilePath = `/users/${user.id}`;

  const submit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (unchanged || !target) return;
    setIsSubmitting(true);
    try {
      await staffUsersService.assignRoles(user.id, [roleId]);
      toast.success(`${user.name}'s access now follows the ${target.name} role.`, {
        title: `Role changed to ${target.name}`,
        actions: pathname === profilePath ? undefined : [{ label: 'View profile', onClick: () => navigate(profilePath) }],
      });
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="change-role-title">
      <div className="fixed inset-0 animate-fade-in bg-zinc-900/40" onClick={() => !isSubmitting && onClose()} />

      <form
        onSubmit={submit}
        className="relative w-full max-w-md animate-pop-in rounded-xl border border-zinc-200 bg-white shadow-2xl shadow-zinc-900/15"
      >
        <div className="flex items-start gap-3 px-5 pt-5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-zinc-700">
            <Shield className="h-4 w-4" />
          </div>
          <div className="min-w-0 flex-1">
            <h3 id="change-role-title" className="text-[15px] font-semibold text-zinc-900">
              Change role
            </h3>
            <p className="mt-0.5 truncate text-[13px] text-zinc-500">
              {user.name} · {user.email}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
            className="-mr-1 rounded-md p-1 text-zinc-400 transition-colors hover:bg-zinc-100 hover:text-zinc-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 py-4">
          <Dropdown
            label="Role"
            value={roleId}
            onChange={setRoleId}
            options={roleOptions}
            placeholder={isLoading ? 'Loading roles…' : 'Select a role'}
            disabled={isLoading || isSubmitting}
            searchable={roleOptions.length > 7}
            error={error ? `Couldn't load roles: ${error.message}` : null}
            emptyText="No active roles"
          />

          {!unchanged && target && (
            <p className="text-[13px] leading-relaxed text-zinc-600">
              <span className="font-medium text-zinc-900">{currentName || 'No role'}</span> →{' '}
              <span className="font-medium text-zinc-900">{target.name}</span>. Their permissions are replaced with the{' '}
              {target.key === 'super_admin' || target.permissions.includes('*')
                ? 'full access this role grants'
                : `${target.permissions.length} permission${target.permissions.length === 1 ? '' : 's'} this role grants`}
              .
            </p>
          )}

          {target?.key === 'super_admin' && !unchanged && (
            <div className="flex items-start gap-2 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0 text-amber-600" />
              Super Admin has unrestricted access to every module, setting and financial record.
            </div>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-zinc-100 px-5 py-3">
          <Button size="sm" variant="outline" type="button" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button size="sm" variant="primary" type="submit" isLoading={isSubmitting} disabled={unchanged || !target}>
            Change role
          </Button>
        </div>
      </form>
    </div>,
    document.body,
  );
};

export default ChangeRoleDialog;
