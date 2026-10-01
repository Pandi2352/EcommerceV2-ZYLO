import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Users,
  Search,
  Plus,
  RefreshCw,
  MoreVertical,
  Edit2,
  Shield,
  KeyRound,
  Trash2,
  ExternalLink,
  Lock,
  Unlock,
  ShieldCheck,
} from 'lucide-react';
import {
  FcConferenceCall,
  FcApproval,
  FcCancel,
  FcPrivacy,
} from 'react-icons/fc';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import ApiLoader from '@shared/ui/Spinner';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import {
  staffUsersService,
  type StaffUserItem,
  type StaffUserStats,
} from '../services/staffUsers.service';
import { rolesService, type Role } from '../services/roles.service';
import { extractErrorMessage } from '@shared/api/client';
import InviteUserDrawer from '../components/users/InviteUserDrawer';
import EditUserDrawer from '../components/users/EditUserDrawer';
import ChangeRoleDialog from '../components/users/ChangeRoleDialog';

export const UsersPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { user: currentUser, can } = useAuth();

  // URL Query State
  const queryQ = searchParams.get('q') || '';
  const queryRole = searchParams.get('role') || '';
  const queryStatus = searchParams.get('status') || '';
  const queryPage = parseInt(searchParams.get('page') || '1', 10);

  const [users, setUsers] = useState<StaffUserItem[]>([]);
  const [stats, setStats] = useState<StaffUserStats>({
    totalStaff: 0,
    activeCount: 0,
    inactiveCount: 0,
    mfaEnabledCount: 0,
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Available Roles for Filter
  const [roles, setRoles] = useState<Role[]>([]);

  // Modals & Drawers
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUserItem | null>(null);
  const [roleUser, setRoleUser] = useState<StaffUserItem | null>(null);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

  // Confirm dialogs
  const [statusConfirmUser, setStatusConfirmUser] = useState<StaffUserItem | null>(null);
  const [deleteConfirmUser, setDeleteConfirmUser] = useState<StaffUserItem | null>(null);
  const [resetConfirmUser, setResetConfirmUser] = useState<StaffUserItem | null>(null);
  const [isActionLoading, setIsActionLoading] = useState(false);

  // Load Roles
  useEffect(() => {
    rolesService
      .listRoles()
      .then((res: any) => {
        const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
        setRoles(list);
      })
      .catch(() => setRoles([]));
  }, []);

  // Fetch Users
  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res: any = await staffUsersService.list({
        page: queryPage,
        limit: 15,
        q: queryQ.trim() || undefined,
        roleId: queryRole || undefined,
        status: queryStatus || undefined,
      });

      const list = Array.isArray(res?.items) ? res.items : Array.isArray(res) ? res : [];
      setUsers(list);
      setTotal(res?.meta?.total ?? res?.total ?? list.length);
      setTotalPages(res?.meta?.totalPages ?? res?.totalPages ?? 1);
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, [queryPage, queryQ, queryRole, queryStatus]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Query Param updater
  const updateQuery = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') {
        next.delete(key);
      } else {
        next.set(key, val);
      }
    });
    // Reset to page 1 whenever filters change, unless page was specifically set
    if (!('page' in updates)) {
      next.set('page', '1');
    }
    setSearchParams(next, { replace: true });
  };

  // Status Toggle
  const handleToggleStatus = async () => {
    if (!statusConfirmUser) return;
    try {
      setIsActionLoading(true);
      if (statusConfirmUser.status === 'ACTIVE') {
        await staffUsersService.deactivate(statusConfirmUser.id);
        toast.success(`Account for ${statusConfirmUser.name} suspended. Sessions terminated.`);
      } else {
        await staffUsersService.activate(statusConfirmUser.id);
        toast.success(`Account for ${statusConfirmUser.name} reactivated.`);
      }
      setStatusConfirmUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Soft Delete
  const handleDeleteUser = async () => {
    if (!deleteConfirmUser) return;
    try {
      setIsActionLoading(true);
      await staffUsersService.softDelete(deleteConfirmUser.id);
      toast.success(`Staff user ${deleteConfirmUser.name} deleted.`);
      setDeleteConfirmUser(null);
      fetchUsers();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Password Reset
  const handleResetPassword = async () => {
    if (!resetConfirmUser) return;
    try {
      setIsActionLoading(true);
      await staffUsersService.resetPassword(resetConfirmUser.id);
      toast.success(`Password reset link emailed to ${resetConfirmUser.email}`);
      setResetConfirmUser(null);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  // Close popup menus on outside click
  useEffect(() => {
    const handleDocClick = () => setActiveMenuId(null);
    window.addEventListener('click', handleDocClick);
    return () => window.removeEventListener('click', handleDocClick);
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Staff Directory</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
              {total} Members
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Manage administrative personnel, assign roles, monitor 2FA security, and control system access.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>
          {can('users.invite') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Invite Member
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-indigo-50/70 border border-indigo-100 flex items-center justify-center shrink-0">
            <FcConferenceCall className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Staff
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.totalStaff}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-emerald-50/70 border border-emerald-100 flex items-center justify-center shrink-0">
            <FcApproval className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Active Accounts
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.activeCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-rose-50/70 border border-rose-100 flex items-center justify-center shrink-0">
            <FcCancel className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Suspended
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.inactiveCount}</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-md border border-slate-200 flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-md bg-sky-50/70 border border-sky-100 flex items-center justify-center shrink-0">
            <FcPrivacy className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              2FA Protected
            </div>
            <div className="text-xl font-bold text-slate-900 mt-0.5">{stats.mfaEnabledCount}</div>
          </div>
        </div>
      </div>

      {/* Filters & Search Bar */}
      <div className="bg-white p-3.5 rounded-md border border-slate-200 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-1 items-center gap-3 min-w-[280px]">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={queryQ}
              onChange={(e) => updateQuery({ q: e.target.value })}
              placeholder="Search by name, email, user code, designation..."
              className="w-full pl-9 pr-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-sm text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
            />
          </div>

          <select
            value={queryRole}
            onChange={(e) => updateQuery({ role: e.target.value })}
            className="px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Roles</option>
            {(roles || []).map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>

          <select
            value={queryStatus}
            onChange={(e) => updateQuery({ status: e.target.value })}
            className="px-3 py-1.5 bg-slate-50/70 border border-slate-200 rounded-md text-sm text-slate-700 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Suspended</option>
          </select>
        </div>

        {(queryQ || queryRole || queryStatus) && (
          <button
            onClick={() => updateQuery({ q: null, role: null, status: null, page: '1' })}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 px-2 py-1"
          >
            Reset Filters
          </button>
        )}
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-md border border-slate-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center">
            <ApiLoader text="Loading staff records..." />
          </div>
        ) : !users || users.length === 0 ? (
          <div className="p-12 text-center">
            <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No staff members found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              No staff members match the selected filter criteria. Try adjusting your search query or role filter.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200/80 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="px-5 py-3.5">Staff Member</th>
                  <th className="px-4 py-3.5">User ID</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Security</th>
                  <th className="px-4 py-3.5">Last Login</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {(users || []).map((u) => {
                  const isCurrent = currentUser?.id === u.id;
                  const isSuperAdmin = u.roleKey === 'super_admin' || u.roleName === 'Super Administrator';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* Name & Email */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-md bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0 border border-indigo-200">
                            {u.firstName?.[0] || u.name?.[0] || 'U'}
                            {u.lastName?.[0] || ''}
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-semibold text-slate-900">{u.name}</span>
                              {isCurrent && (
                                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded-md bg-indigo-50 text-indigo-600 border border-indigo-200">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-slate-500">{u.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* User ID code */}
                      <td className="px-4 py-3.5">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                          {u.userCode || '—'}
                        </span>
                        {u.designation && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                            {u.designation}
                          </div>
                        )}
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-semibold ${
                            isSuperAdmin
                              ? 'bg-purple-50 text-purple-700 border border-purple-200'
                              : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          }`}
                        >
                          <Shield className="w-3 h-3" />
                          {u.roleName}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3.5">
                        {u.status === 'ACTIVE' ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Security / MFA */}
                      <td className="px-4 py-3.5">
                        {u.mfaEnabled ? (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700">
                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                            2FA Enabled
                          </span>
                        ) : (
                          <span className="text-xs text-slate-400">2FA Inactive</span>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="px-4 py-3.5 text-xs text-slate-500">
                        {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never logged in'}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3.5 text-right relative">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => navigate(`/users/${u.id}`)}
                            title="View Full Details"
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-slate-100 rounded-md transition-colors"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          <div className="relative">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(activeMenuId === u.id ? null : u.id);
                              }}
                              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-md transition-colors"
                            >
                              <MoreVertical className="w-4 h-4" />
                            </button>

                            {activeMenuId === u.id && (
                              <div
                                onClick={(e) => e.stopPropagation()}
                                className="absolute right-0 mt-1 w-48 bg-white rounded-md border border-slate-200 py-1.5 z-30 animate-in fade-in text-left"
                              >
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActiveMenuId(null);
                                    navigate(`/users/${u.id}`);
                                  }}
                                  className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                >
                                  <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                                  View Profile & Perms
                                </button>

                                {can('users.edit') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setEditingUser(u);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                                    Edit Profile
                                  </button>
                                )}

                                {can('roles.assign') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setRoleUser(u);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <Shield className="w-3.5 h-3.5 text-slate-400" />
                                    Change Role
                                  </button>
                                )}

                                {can('users.edit') && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setResetConfirmUser(u);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    <KeyRound className="w-3.5 h-3.5 text-slate-400" />
                                    Reset Password
                                  </button>
                                )}

                                {can('users.activate') && !isCurrent && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setActiveMenuId(null);
                                      setStatusConfirmUser(u);
                                    }}
                                    className="w-full px-3 py-1.5 text-xs text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                                  >
                                    {u.status === 'ACTIVE' ? (
                                      <>
                                        <Lock className="w-3.5 h-3.5 text-amber-500" />
                                        Suspend Account
                                      </>
                                    ) : (
                                      <>
                                        <Unlock className="w-3.5 h-3.5 text-emerald-500" />
                                        Reactivate Account
                                      </>
                                    )}
                                  </button>
                                )}

                                {can('users.delete') && !isCurrent && (
                                  <div className="border-t border-slate-100 my-1 pt-1">
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveMenuId(null);
                                        setDeleteConfirmUser(u);
                                      }}
                                      className="w-full px-3 py-1.5 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                      Delete Account
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
        {totalPages > 1 && (
          <div className="px-5 py-3.5 bg-slate-50/80 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500">
            <div>
              Showing page <span className="font-semibold text-slate-700">{queryPage}</span> of{' '}
              <span className="font-semibold text-slate-700">{totalPages}</span> ({total} items)
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={queryPage <= 1}
                onClick={() => updateQuery({ page: String(queryPage - 1) })}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={queryPage >= totalPages}
                onClick={() => updateQuery({ page: String(queryPage + 1) })}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Drawers & Dialogs */}
      <InviteUserDrawer
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        onSuccess={fetchUsers}
        suggestedUserCode={`ZY-${String(total + 1).padStart(4, '0')}`}
      />

      <EditUserDrawer
        isOpen={!!editingUser}
        onClose={() => setEditingUser(null)}
        user={editingUser}
        onSuccess={fetchUsers}
      />

      <ChangeRoleDialog
        isOpen={!!roleUser}
        onClose={() => setRoleUser(null)}
        user={roleUser}
        onSuccess={fetchUsers}
      />

      {/* Status Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!statusConfirmUser}
        onClose={() => setStatusConfirmUser(null)}
        onConfirm={handleToggleStatus}
        isLoading={isActionLoading}
        title={statusConfirmUser?.status === 'ACTIVE' ? 'Suspend Staff Account' : 'Reactivate Staff Account'}
        description={
          statusConfirmUser?.status === 'ACTIVE' ? (
            <span>
              Are you sure you want to suspend <strong>{statusConfirmUser?.name}</strong>? This will immediately terminate all active sessions and block console login.
            </span>
          ) : (
            <span>
              Reactivate console access for <strong>{statusConfirmUser?.name}</strong>?
            </span>
          )
        }
        tone={statusConfirmUser?.status === 'ACTIVE' ? 'warning' : 'primary'}
        confirmText={statusConfirmUser?.status === 'ACTIVE' ? 'Suspend Account' : 'Reactivate Account'}
      />

      {/* Delete Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirmUser}
        onClose={() => setDeleteConfirmUser(null)}
        onConfirm={handleDeleteUser}
        isLoading={isActionLoading}
        title="Delete Staff Account"
        description={
          <span>
            Are you sure you want to delete <strong>{deleteConfirmUser?.name}</strong> ({deleteConfirmUser?.email})? All active refresh tokens will be revoked immediately and the user will lose console access permanently.
          </span>
        }
        tone="danger"
        confirmText="Permanently Delete"
      />

      {/* Reset Password Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!resetConfirmUser}
        onClose={() => setResetConfirmUser(null)}
        onConfirm={handleResetPassword}
        isLoading={isActionLoading}
        title="Send Password Reset"
        description={
          <span>
            Send a password reset email link to <strong>{resetConfirmUser?.email}</strong>?
          </span>
        }
        tone="primary"
        confirmText="Send Reset Email"
      />
    </div>
  );
};

export default UsersPage;
