import React, { useMemo, useState } from 'react';
import { KeyRound, ShieldAlert } from 'lucide-react';
import SearchInput from '@shared/ui/SearchInput';
import Badge from '@shared/ui/Badge';
import EmptyState from '@shared/ui/EmptyState';
import Button from '@shared/ui/Button';
import type { Role } from '../../../../services/roles.service';
import type { GroupedPermissionDomain } from '../../../../services/permissions.service';
import RolePermissionsDiffModal from '../../../../components/roles/RolePermissionsDiffModal';
import type { PermissionDraft } from '../../hooks/usePermissionDraft';
import { filterCatalog, groupKeys } from '../../lib/permissionCatalog';
import { isSuperAdminRole } from '../../lib/roleRules';
import PermissionGroup from './PermissionGroup';
import PermissionSaveBar from './PermissionSaveBar';

export interface PermissionEditorProps {
  role: Role;
  catalog: GroupedPermissionDomain[];
  draft: PermissionDraft;
}

const toggleIn = (set: Set<string>, id: string) => {
  const next = new Set(set);
  if (next.has(id)) next.delete(id);
  else next.add(id);
  return next;
};

/** Accordion of group → module → permission with search, bulk actions and a reviewed save. */
export const PermissionEditor: React.FC<PermissionEditorProps> = ({ role, catalog, draft }) => {
  const [search, setSearch] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
  const [collapsedModules, setCollapsedModules] = useState<Set<string>>(new Set());
  const [reviewOpen, setReviewOpen] = useState(false);

  const superAdmin = isSuperAdminRole(role);
  const readOnlyReason = superAdmin
    ? 'Super Admin always has every permission'
    : draft.readOnly
      ? "You don't have permission to change this role's permissions"
      : undefined;

  const visible = useMemo(() => filterCatalog(catalog, search), [catalog, search]);
  const allKeys = useMemo(() => catalog.flatMap(groupKeys), [catalog]);
  const selectedCount = allKeys.filter(draft.has).length;
  const searching = search.trim().length > 0;
  const allCollapsed = collapsedGroups.size === catalog.length && catalog.length > 0;

  const expandAll = () => {
    setCollapsedGroups(new Set());
    setCollapsedModules(new Set());
  };

  return (
    <div>
      {readOnlyReason && (
        <div className="mb-3 flex items-start gap-2.5 rounded-lg border border-zinc-200 bg-zinc-50 px-3.5 py-2.5 text-[13px] text-zinc-700">
          <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-zinc-500" />
          <p>
            <span className="font-medium text-zinc-900">Read-only. </span>
            {superAdmin ? 'Super Admin always has every permission, so its permissions are locked.' : readOnlyReason + '.'}
          </p>
        </div>
      )}

      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-[13px] text-zinc-600">
          <span className="tabular-nums">
            <span className="font-medium text-zinc-900">{superAdmin ? allKeys.length : selectedCount}</span> of {allKeys.length} selected
          </span>
          {draft.isDirty && <Badge tone="warning">{draft.changeCount} unsaved</Badge>}
        </div>
        <div className="flex items-center gap-2">
          <SearchInput value={search} onChange={setSearch} placeholder="Search permissions…" className="w-64" />
          <Button size="sm" variant="outline" onClick={allCollapsed ? expandAll : () => setCollapsedGroups(new Set(catalog.map((g) => g.group)))}>
            {allCollapsed ? 'Expand all' : 'Collapse all'}
          </Button>
        </div>
      </div>

      {visible.length === 0 ? (
        <div className="rounded-lg border border-zinc-200 bg-white">
          <EmptyState
            icon={<KeyRound />}
            title={searching ? 'No permissions match your search' : 'The permission catalog is empty'}
            description={searching ? 'Try a module name, an action like "edit", or a permission key.' : "The catalog couldn't be loaded. Reload the page to try again."}
            action={searching && <Button size="sm" variant="outline" onClick={() => setSearch('')}>Clear search</Button>}
          />
        </div>
      ) : (
        <div className="space-y-2">
          {visible.map((group) => (
            <PermissionGroup
              key={group.group}
              group={group}
              draft={draft}
              // Search results are always shown expanded
              expanded={searching || !collapsedGroups.has(group.group)}
              onToggle={() => setCollapsedGroups((s) => toggleIn(s, group.group))}
              isModuleExpanded={(id) => searching || !collapsedModules.has(id)}
              onToggleModule={(id) => setCollapsedModules((s) => toggleIn(s, id))}
              readOnlyReason={readOnlyReason}
            />
          ))}
        </div>
      )}

      {draft.isDirty && (
        <PermissionSaveBar
          added={draft.added.length}
          removed={draft.removed.length}
          onDiscard={draft.discard}
          onReview={() => setReviewOpen(true)}
        />
      )}

      <RolePermissionsDiffModal
        isOpen={reviewOpen}
        onClose={() => setReviewOpen(false)}
        onConfirm={async (reason) => {
          if (await draft.save(reason)) setReviewOpen(false);
        }}
        addedPermissions={draft.added}
        removedPermissions={draft.removed}
        sensitivePermissions={draft.sensitiveChanges}
        roleName={role.name}
        userCount={role.userCount}
        isLoading={draft.isSaving}
      />
    </div>
  );
};

export default PermissionEditor;
