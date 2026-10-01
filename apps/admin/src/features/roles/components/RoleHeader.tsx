import React from 'react';
import { Copy, Pencil, Power, PowerOff, Trash2 } from 'lucide-react';
import Badge from '@shared/ui/Badge';
import Button from '@shared/ui/Button';
import StatusPill from '@shared/ui/StatusPill';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import type { Role } from '../../../services/roles.service';
import { permissionCountLabel, roleRestrictions } from '../lib/roleRules';

export interface RoleHeaderProps {
  role: Role;
  onEdit: () => void;
  onToggleStatus: () => void;
  onDelete: () => void;
}

/** A disabled button can't show a tooltip itself, so the reason sits on a wrapper. */
const Gate: React.FC<{ reason: string | null; children: React.ReactNode }> = ({ reason, children }) =>
  reason ? (
    <span title={reason} className="inline-flex cursor-not-allowed">
      {children}
    </span>
  ) : (
    <>{children}</>
  );

const Chip: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <span className="inline-flex items-center gap-1 rounded-md border border-zinc-200 px-1.5 py-0.5 text-xs text-zinc-500">
    {label} <span className="font-medium tabular-nums text-zinc-900">{value}</span>
  </span>
);

/** Role card: identity, state, counts and role-level actions. */
export const RoleHeader: React.FC<RoleHeaderProps> = ({ role, onEdit, onToggleStatus, onDelete }) => {
  const { can } = useAuth();
  const blocked = roleRestrictions(role);
  const active = role.status === 'ACTIVE';

  const copyKey = () =>
    navigator.clipboard
      .writeText(role.key)
      .then(() => toast.success('Role key copied to the clipboard.'))
      .catch(() => toast.error("Couldn't copy the key."));

  return (
    <header className="mb-4">

      <div className="flex flex-wrap items-start justify-between gap-4 rounded-lg border border-zinc-200 bg-white p-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl font-semibold tracking-tight text-zinc-900">{role.name}</h1>
            <StatusPill tone={active ? 'success' : 'neutral'}>{active ? 'Active' : 'Inactive'}</StatusPill>
            <Badge>{role.isSystem ? 'System' : 'Custom'}</Badge>
          </div>
          <div className="mt-1 flex items-center gap-1">
            <code className="font-mono text-xs text-zinc-600">{role.key}</code>
            <button
              type="button"
              onClick={copyKey}
              aria-label="Copy role key"
              title="Copy key"
              className="rounded p-1 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            >
              <Copy className="h-3 w-3" />
            </button>
          </div>
          {role.description && <p className="mt-1.5 max-w-2xl text-[13px] text-zinc-600">{role.description}</p>}
          <div className="mt-3 flex items-center gap-1.5">
            <Chip label="Users" value={String(role.userCount ?? 0)} />
            <Chip label="Permissions" value={permissionCountLabel(role)} />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {can('roles.edit') && (
            <>
              <Gate reason={blocked.edit}>
                <Button size="sm" variant="outline" leftIcon={<Pencil />} onClick={onEdit} disabled={!!blocked.edit}>
                  Edit
                </Button>
              </Gate>
              <Gate reason={blocked.status}>
                <Button size="sm" variant="outline" leftIcon={active ? <PowerOff /> : <Power />} onClick={onToggleStatus} disabled={!!blocked.status}>
                  {active ? 'Deactivate' : 'Activate'}
                </Button>
              </Gate>
            </>
          )}
          {can('roles.delete') && (
            <Gate reason={blocked.delete}>
              <Button size="sm" variant="outline" leftIcon={<Trash2 />} onClick={onDelete} disabled={!!blocked.delete}>
                Delete
              </Button>
            </Gate>
          )}
        </div>
      </div>
    </header>
  );
};

export default RoleHeader;
