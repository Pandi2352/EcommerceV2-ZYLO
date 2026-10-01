import { Link } from 'react-router-dom';
import { AlignLeft, Calendar, CircleDot, KeyRound, Shield, Users } from 'lucide-react';
import Badge from '@shared/ui/Badge';
import StatusPill from '@shared/ui/StatusPill';
import type { DataTableColumn } from '@shared/ui/DataTable';
import { formatDateTime } from '@shared/utils/format';
import type { Role } from '../../../services/roles.service';
import { hasAllPermissions } from '../lib/roleRules';
import RoleRowActions, { type RoleRowHandlers } from './RoleRowActions';

const muted = <span className="text-zinc-400">—</span>;

/** Column definitions for the roles table. */
export function rolesColumns(handlers: RoleRowHandlers): DataTableColumn<Role>[] {
  return [
    {
      key: 'name',
      header: 'Role',
      icon: <Shield />,
      render: (r) => (
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <Link
              to={`/roles/${r.id}`}
              onClick={(e) => e.stopPropagation()}
              className="font-medium text-zinc-900 hover:underline"
            >
              {r.name}
            </Link>
            {r.isSystem && <Badge>System</Badge>}
          </div>
          <div className="font-mono text-xs text-zinc-500">{r.key}</div>
        </div>
      ),
    },
    {
      key: 'description',
      header: 'Description',
      icon: <AlignLeft />,
      className: 'max-w-xs',
      render: (r) =>
        r.description ? (
          <span className="block truncate text-zinc-600" title={r.description}>
            {r.description}
          </span>
        ) : (
          muted
        ),
    },
    {
      key: 'users',
      header: 'Users',
      icon: <Users />,
      align: 'right',
      render: (r) => <span className="tabular-nums">{r.userCount ?? 0}</span>,
    },
    {
      key: 'permissions',
      header: 'Permissions',
      icon: <KeyRound />,
      align: 'right',
      render: (r) =>
        hasAllPermissions(r) ? <Badge tone="info">All</Badge> : <span className="tabular-nums">{r.permissions.length}</span>,
    },
    {
      key: 'status',
      header: 'Status',
      icon: <CircleDot />,
      render: (r) => (
        <StatusPill tone={r.status === 'ACTIVE' ? 'success' : 'neutral'}>{r.status === 'ACTIVE' ? 'Active' : 'Inactive'}</StatusPill>
      ),
    },
    {
      key: 'updated',
      header: 'Updated',
      icon: <Calendar />,
      render: (r) => <span className="tabular-nums text-zinc-600">{formatDateTime(r.updatedAt ?? r.createdAt)}</span>,
    },
    {
      key: 'actions',
      sticky: 'right',
      header: 'Actions',
      align: 'right',
      render: (r) => <RoleRowActions role={r} {...handlers} />,
    },
  ];
}
