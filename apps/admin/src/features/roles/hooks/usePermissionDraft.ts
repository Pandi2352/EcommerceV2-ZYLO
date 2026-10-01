import { useMemo, useState } from 'react';
import { useAuth } from '@shared/auth/AuthContext';
import { toast } from '@shared/ui/Toast';
import { extractErrorMessage } from '@shared/api/client';
import { rolesService, type Role } from '../../../services/roles.service';
import type { GroupedPermissionDomain } from '../../../services/permissions.service';
import { indexCatalog } from '../lib/permissionCatalog';
import { isSuperAdminRole, pluralize } from '../lib/roleRules';

/** The PUT returns `{ role, diff }`; older builds returned the role itself. */
function toRole(res: unknown): Role {
  const wrapped = (res as { role?: Role })?.role;
  return wrapped ?? (res as Role);
}

/**
 * Unsaved permission edits for one role, diffed against the saved set.
 * Mirrors the server rules: any action implies the module's `view`, and
 * only permissions the signed-in user holds can be granted (R5).
 */
export function usePermissionDraft(role: Role | null, catalog: GroupedPermissionDomain[], onSaved: (role: Role) => void) {
  const { can } = useAuth();
  const readOnly = !role || isSuperAdminRole(role) || !can('roles.assign');
  const index = useMemo(() => indexCatalog(catalog), [catalog]);

  // Keyed on the permission list itself, so renaming or (de)activating the role keeps the draft
  const savedKey = [...(role?.permissions ?? [])].sort().join('|');
  const saved = useMemo(() => new Set<string>(savedKey ? savedKey.split('|') : []), [savedKey]);
  const [current, setCurrent] = useState<Set<string>>(saved);
  const [baseline, setBaseline] = useState(saved);
  if (baseline !== saved) {
    setBaseline(saved);
    setCurrent(new Set(saved));
  }
  const [isSaving, setIsSaving] = useState(false);

  const canGrant = (key: string) => can(key);
  /** Wildcard roles (super admin) hold every key */
  const has = (key: string) => current.has('*') || current.has(key);

  const { added, removed } = useMemo(() => {
    if (readOnly) return { added: [] as string[], removed: [] as string[] };
    return {
      added: [...current].filter((p) => !saved.has(p)),
      removed: [...saved].filter((p) => !current.has(p)),
    };
  }, [readOnly, current, saved]);

  const update = (mutate: (next: Set<string>) => void) => {
    if (readOnly) return;
    setCurrent((prev) => {
      const next = new Set(prev);
      mutate(next);
      return next;
    });
  };

  /** Add keys (and their module's view); removing a view removes the module's other actions. */
  const applyOn = (next: Set<string>, key: string) => {
    if (!canGrant(key)) return;
    next.add(key);
    const viewKey = index.get(key)?.viewKey;
    if (viewKey && viewKey !== key && canGrant(viewKey)) next.add(viewKey);
  };
  const applyOff = (next: Set<string>, key: string) => {
    next.delete(key);
    const meta = index.get(key);
    if (meta?.action === 'view') meta.moduleKeys.forEach((k) => next.delete(k));
  };

  const toggle = (key: string) => update((next) => (next.has(key) ? applyOff(next, key) : applyOn(next, key)));
  const setMany = (keys: string[], on: boolean) => update((next) => keys.forEach((k) => (on ? applyOn(next, k) : applyOff(next, k))));
  /** Keep only `view` in the given module keys. */
  const viewOnly = (keys: string[]) =>
    update((next) =>
      keys.forEach((k) => {
        if (index.get(k)?.action === 'view') applyOn(next, k);
        else next.delete(k);
      }),
    );

  const discard = () => setCurrent(new Set(saved));

  const save = async (reason: string) => {
    if (!role) return false;
    try {
      setIsSaving(true);
      const res = await rolesService.assignPermissions(role.id, {
        permissions: Array.from(current),
        reason: reason.trim() || undefined,
      });
      const updated = toRole(res);
      onSaved(updated);
      const users = updated.userCount ?? role.userCount ?? 0;
      toast.success(`Effective immediately for ${pluralize(users, 'user')}.`, { title: `Permissions updated for "${updated.name}"` });
      return true;
    } catch (err) {
      toast.error(extractErrorMessage(err));
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const sensitiveChanges = [...added, ...removed].filter((k) => index.get(k)?.isSensitive);

  return {
    current,
    readOnly,
    added,
    removed,
    changeCount: added.length + removed.length,
    isDirty: added.length + removed.length > 0,
    sensitiveChanges,
    isSaving,
    has,
    canGrant,
    toggle,
    setMany,
    viewOnly,
    discard,
    save,
  };
}

export type PermissionDraft = ReturnType<typeof usePermissionDraft>;
