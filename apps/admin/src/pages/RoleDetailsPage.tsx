import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Key,
  Users,
  Settings,
  Search,
  ChevronDown,
  ChevronRight,
  Save,
  Lock,
} from 'lucide-react';
import Button from '@shared/ui/Button';
import ApiLoader from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import {
  rolesService,
  type Role,
  type RoleUserItem,
} from '../services/roles.service';
import {
  permissionsService,
  type GroupedPermissionDomain,
  type ModulePermissions,
} from '../services/permissions.service';
import { extractErrorMessage } from '@shared/api/client';
import RolePermissionsDiffModal from '../components/roles/RolePermissionsDiffModal';
import { formatDateTime } from '@shared/utils/format';
import { ROUTES } from '../routes/routePaths';

export const RoleDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'permissions' | 'users' | 'settings'>('permissions');

  // Role and catalog state
  const [role, setRole] = useState<Role | null>(null);
  const [roleUsers, setRoleUsers] = useState<RoleUserItem[]>([]);
  const [catalog, setCatalog] = useState<GroupedPermissionDomain[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Selected permissions state
  const [savedPermissions, setSavedPermissions] = useState<Set<string>>(new Set());
  const [currentPermissions, setCurrentPermissions] = useState<Set<string>>(new Set());

  // Search & Accordion
  const [permSearch, setPermSearch] = useState('');
  const [expandedDomains, setExpandedDomains] = useState<Set<string>>(new Set());

  // Diff Modal & Saving
  const [isDiffModalOpen, setIsDiffModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Edit Settings state
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editStatus, setEditStatus] = useState<'ACTIVE' | 'INACTIVE'>('ACTIVE');
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);

  // Load Role & Catalog
  const fetchData = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const [roleData, catalogData, usersData] = await Promise.all([
        rolesService.getRoleById(id),
        permissionsService.getGroupedPermissions().catch(() => []),
        rolesService.getRoleUsers(id).catch(() => []),
      ]);

      setRole(roleData);
      const catalogList = Array.isArray(catalogData) ? catalogData : Array.isArray((catalogData as any)?.data) ? (catalogData as any).data : [];
      setCatalog(catalogList);
      const usersList = Array.isArray((usersData as any)?.items) ? (usersData as any).items : Array.isArray(usersData) ? usersData : [];
      setRoleUsers(usersList);

      const permsSet = new Set(roleData.permissions || []);
      setSavedPermissions(permsSet);
      setCurrentPermissions(new Set(permsSet));

      // Expand all domains initially
      setExpandedDomains(new Set(catalogList.map((d: any) => d.group)));

      // Settings fields
      setEditName(roleData.name);
      setEditDescription(roleData.description || '');
      setEditStatus(roleData.status);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      navigate(ROUTES.ROLES);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const isSuperAdmin = role?.key === 'super_admin';

  // Compute diffs
  const { addedPermissions, removedPermissions, isDirty } = useMemo(() => {
    if (!role || isSuperAdmin) {
      return { addedPermissions: [], removedPermissions: [], isDirty: false };
    }
    const added: string[] = [];
    const removed: string[] = [];

    currentPermissions.forEach((p) => {
      if (!savedPermissions.has(p)) added.push(p);
    });

    savedPermissions.forEach((p) => {
      if (!currentPermissions.has(p)) removed.push(p);
    });

    return {
      addedPermissions: added,
      removedPermissions: removed,
      isDirty: added.length > 0 || removed.length > 0,
    };
  }, [role, isSuperAdmin, currentPermissions, savedPermissions]);

  // Toggle single permission
  const handleTogglePermission = (key: string) => {
    if (isSuperAdmin) return;
    const next = new Set(currentPermissions);
    if (next.has(key)) {
      next.delete(key);
    } else {
      next.add(key);
    }
    setCurrentPermissions(next);
  };

  // Module level toggle (View only vs Full Access vs Clear)
  const handleModuleAction = (mod: ModulePermissions, action: 'all' | 'view' | 'none') => {
    if (isSuperAdmin) return;
    const next = new Set(currentPermissions);

    if (action === 'none') {
      mod.permissions.forEach((p) => next.delete(p.key));
    } else if (action === 'all') {
      mod.permissions.forEach((p) => next.add(p.key));
    } else if (action === 'view') {
      mod.permissions.forEach((p) => {
        if (p.action === 'view') {
          next.add(p.key);
        } else {
          next.delete(p.key);
        }
      });
    }
    setCurrentPermissions(next);
  };

  // Accordion toggle
  const toggleDomain = (group: string) => {
    const next = new Set(expandedDomains);
    if (next.has(group)) {
      next.delete(group);
    } else {
      next.add(group);
    }
    setExpandedDomains(next);
  };

  // Discard changes
  const handleDiscard = () => {
    setCurrentPermissions(new Set(savedPermissions));
  };

  // Save changes
  const handleSavePermissions = async (reason: string) => {
    if (!role) return;
    try {
      setIsSaving(true);
      const updated = await rolesService.assignPermissions(role.id, {
        permissions: Array.from(currentPermissions),
        reason: reason.trim() || undefined,
      });

      const nextSet = new Set(updated.permissions || []);
      setSavedPermissions(nextSet);
      setCurrentPermissions(new Set(nextSet));
      setRole(updated);
      setIsDiffModalOpen(false);
      toast.success(`Permissions updated successfully for "${updated.name}"`);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsSaving(false);
    }
  };

  // Save Settings
  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) return;

    if (!editName.trim()) {
      toast.error('Role name is required');
      return;
    }

    try {
      setIsUpdatingSettings(true);
      const updated = await rolesService.updateRole(role.id, {
        name: editName.trim(),
        description: editDescription.trim() || undefined,
        status: editStatus,
      });

      setRole(updated);
      toast.success('Role settings updated');
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-8 text-center bg-white rounded-md border border-slate-200">
        <ApiLoader text="Loading role details..." minHeight="min-h-[320px]" />
      </div>
    );
  }

  if (!role) return null;

  // Filter permissions based on search
  const filteredCatalog = catalog
    .map((domain) => {
      const filteredModules = domain.modules
        .map((mod) => {
          const matching = mod.permissions.filter(
            (p) =>
              p.name.toLowerCase().includes(permSearch.toLowerCase()) ||
              p.key.toLowerCase().includes(permSearch.toLowerCase()) ||
              p.description.toLowerCase().includes(permSearch.toLowerCase()),
          );
          return { ...mod, permissions: matching };
        })
        .filter((mod) => mod.permissions.length > 0);

      return { ...domain, modules: filteredModules };
    })
    .filter((domain) => domain.modules.length > 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to={ROUTES.ROLES} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Roles & Permissions
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{role.name}</span>
      </div>

      {/* Role Header Card */}
      <div className="bg-white rounded-md border border-slate-200 p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-md flex items-center justify-center shrink-0 border ${
                isSuperAdmin
                  ? 'bg-purple-100 text-purple-700 border-purple-200'
                  : role.isSystem
                  ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}
            >
              {isSuperAdmin ? (
                <ShieldAlert className="w-7 h-7" />
              ) : role.isSystem ? (
                <ShieldCheck className="w-7 h-7" />
              ) : (
                <Shield className="w-7 h-7" />
              )}
            </div>

            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{role.name}</h1>
                <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                  {role.key}
                </span>
                {role.isSystem ? (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                    <Lock className="w-2.5 h-2.5" />
                    System Role
                  </span>
                ) : (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
                    Custom Role
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-1 max-w-2xl leading-relaxed">
                {role.description || 'Pre-configured access controls and authorization capabilities.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">
              Assigned to <strong className="text-slate-800">{roleUsers.length}</strong> staff member(s)
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-4 mt-6 pt-4 border-t border-slate-100">
          <button
            type="button"
            onClick={() => setActiveTab('permissions')}
            className={`pb-2 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'permissions'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Permissions Matrix
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
              {isSuperAdmin ? 'Root (*)' : currentPermissions.size}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('users')}
            className={`pb-2 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'users'
                ? 'border-indigo-600 text-indigo-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            Assigned Users
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-slate-100 text-slate-600 font-semibold">
              {roleUsers.length}
            </span>
          </button>

          {!role.isSystem && (
            <button
              type="button"
              onClick={() => setActiveTab('settings')}
              className={`pb-2 px-1 text-xs font-bold border-b-2 flex items-center gap-2 transition-colors ${
                activeTab === 'settings'
                  ? 'border-indigo-600 text-indigo-600'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              Role Settings
            </button>
          )}
        </div>
      </div>

      {/* TAB 1: Permissions Matrix */}
      {activeTab === 'permissions' && (
        <div className="space-y-4">
          {/* Super Admin Notice */}
          {isSuperAdmin && (
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-md flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-purple-900">Protected Super Administrator</h4>
                <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                  Super Administrator inherently possesses the universal root wildcard (`*`). Granular permission checkboxes are locked and unalterable to protect platform integrity.
                </p>
              </div>
            </div>
          )}

          {/* Search & Actions Bar */}
          <div className="bg-white p-4 rounded-md border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={permSearch}
                onChange={(e) => setPermSearch(e.target.value)}
                placeholder="Search by action, module, or permission name..."
                className="w-full pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setExpandedDomains(new Set(catalog.map((d) => d.group)))}
              >
                Expand All
              </Button>
              <Button variant="outline" size="sm" onClick={() => setExpandedDomains(new Set())}>
                Collapse All
              </Button>
            </div>
          </div>

          {/* Accordion List */}
          <div className="space-y-4">
            {filteredCatalog.map((domain) => {
              const isExpanded = expandedDomains.has(domain.group);
              const domainPermCount = domain.modules.reduce((sum, m) => sum + m.permissions.length, 0);
              const domainActiveCount = domain.modules.reduce(
                (sum, m) => sum + m.permissions.filter((p) => currentPermissions.has(p.key)).length,
                0,
              );

              return (
                <div
                  key={domain.group}
                  className="bg-white rounded-md border border-slate-200 overflow-hidden"
                >
                  {/* Domain Header */}
                  <div
                    onClick={() => toggleDomain(domain.group)}
                    className="p-4 bg-slate-50/70 border-b border-slate-200/60 flex items-center justify-between cursor-pointer hover:bg-slate-100/60 transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      {isExpanded ? (
                        <ChevronDown className="w-4 h-4 text-slate-500" />
                      ) : (
                        <ChevronRight className="w-4 h-4 text-slate-500" />
                      )}
                      <h3 className="text-sm font-bold text-slate-900 tracking-tight">
                        {domain.group}
                      </h3>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-200/70 text-slate-700">
                        {domainActiveCount}/{domainPermCount} Active
                      </span>
                    </div>
                  </div>

                  {/* Domain Modules */}
                  {isExpanded && (
                    <div className="p-5 space-y-4">
                      {domain.modules.map((mod) => {
                        const totalInMod = mod.permissions.length;
                        const activeInMod = mod.permissions.filter((p) =>
                          currentPermissions.has(p.key),
                        ).length;

                        return (
                          <div
                            key={mod.module}
                            className="rounded-md border border-slate-200/70 overflow-hidden bg-white"
                          >
                            {/* Module Bar */}
                            <div className="px-4 py-2.5 bg-slate-50/60 border-b border-slate-200/60 flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                                  {mod.module}
                                </span>
                                <span className="text-[10px] font-semibold text-slate-400">
                                  ({activeInMod}/{totalInMod})
                                </span>
                              </div>

                              {!isSuperAdmin && (
                                <div className="flex items-center gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => handleModuleAction(mod, 'all')}
                                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-0.5 rounded-md hover:bg-indigo-50 transition-colors"
                                  >
                                    Select All
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleModuleAction(mod, 'view')}
                                    className="text-[11px] font-semibold text-slate-600 hover:text-slate-800 px-2 py-0.5 rounded-md hover:bg-slate-100 transition-colors"
                                  >
                                    View Only
                                  </button>
                                  <span className="text-slate-300">|</span>
                                  <button
                                    type="button"
                                    onClick={() => handleModuleAction(mod, 'none')}
                                    className="text-[11px] font-semibold text-rose-600 hover:text-rose-800 px-2 py-0.5 rounded-md hover:bg-rose-50 transition-colors"
                                  >
                                    Clear
                                  </button>
                                </div>
                              )}
                            </div>

                            {/* Permissions Grid */}
                            <div className="p-3 grid grid-cols-1 md:grid-cols-2 gap-2">
                              {mod.permissions.map((p) => {
                                const isChecked = currentPermissions.has(p.key) || isSuperAdmin;

                                return (
                                  <label
                                    key={p.key}
                                    className={`p-2.5 rounded-md border transition-all flex items-start gap-2.5 ${
                                      isSuperAdmin
                                        ? 'border-purple-200 bg-purple-50/30 cursor-not-allowed opacity-90'
                                        : isChecked
                                        ? 'border-indigo-500 bg-indigo-50/40 cursor-pointer'
                                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50 cursor-pointer'
                                    }`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isChecked}
                                      disabled={isSuperAdmin}
                                      onChange={() => handleTogglePermission(p.key)}
                                      className="mt-0.5 rounded-md border-slate-300 text-indigo-600 focus:ring-indigo-500/20 w-4 h-4"
                                    />
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-1.5">
                                        <span className="text-xs font-bold text-slate-900 leading-tight">
                                          {p.name}
                                        </span>
                                        {p.isSensitive && (
                                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-md bg-rose-100 text-rose-700">
                                            Sensitive
                                          </span>
                                        )}
                                      </div>
                                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">
                                        {p.key}
                                      </div>
                                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-1 leading-snug">
                                        {p.description}
                                      </p>
                                    </div>
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: Assigned Staff Users */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Assigned Staff Members</h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Personnel actively granted permissions through this role.
              </p>
            </div>
          </div>

          {roleUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No staff members are currently assigned to this role.
            </div>
          ) : (
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-slate-50/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider border-b border-slate-200/80">
                    <th className="px-5 py-3">Staff Member</th>
                    <th className="px-4 py-3">User Code</th>
                    <th className="px-4 py-3">Designation</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3">Joined Date</th>
                    <th className="px-4 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roleUsers.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-semibold text-slate-900">
                        <div>{u.firstName} {u.lastName}</div>
                        <div className="text-xs text-slate-400 font-normal">{u.email}</div>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs">{u.userCode}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">{u.designation || '—'}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`text-xs px-2 py-0.5 rounded-md font-medium ${
                            u.status === 'ACTIVE'
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-rose-50 text-rose-700'
                          }`}
                        >
                          {u.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(u.joinedAt)}</td>
                      <td className="px-4 py-3 text-right">
                        <Link
                          to={`/users/${u.id}`}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          View Profile
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Role Settings */}
      {activeTab === 'settings' && !role.isSystem && (
        <div className="bg-white rounded-md border border-slate-200 p-6 max-w-xl">
          <h3 className="text-base font-bold text-slate-900 mb-4">Edit Role Settings</h3>
          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Role Name</label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Description</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Status</label>
              <select
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-md text-sm text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              >
                <option value="ACTIVE">Active (Assign to staff members)</option>
                <option value="INACTIVE">Inactive (Prevent new assignments)</option>
              </select>
            </div>

            <div className="pt-2">
              <Button variant="primary" type="submit" isLoading={isUpdatingSettings}>
                Save Role Settings
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Floating Unsaved Changes Bar */}
      {isDirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-slate-900 text-white px-6 py-3.5 rounded-md border border-slate-700 flex items-center gap-6 z-40 animate-in slide-in-from-bottom duration-200">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
            <span className="text-sm font-semibold">
              {addedPermissions.length + removedPermissions.length} unsaved permission change(s)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleDiscard} className="text-white hover:text-white border-slate-700">
              Discard
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsDiffModalOpen(true)}
              leftIcon={<Save className="w-3.5 h-3.5" />}
            >
              Review & Save
            </Button>
          </div>
        </div>
      )}

      {/* Diff Review Modal */}
      <RolePermissionsDiffModal
        isOpen={isDiffModalOpen}
        onClose={() => setIsDiffModalOpen(false)}
        onConfirm={handleSavePermissions}
        addedPermissions={addedPermissions}
        removedPermissions={removedPermissions}
        roleName={role.name}
        isLoading={isSaving}
      />
    </div>
  );
};

export default RoleDetailsPage;
