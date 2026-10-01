import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  Shield,
  ShieldCheck,
  Mail,
  Briefcase,
  Clock,
  KeyRound,
  Edit2,
  Trash2,
  Lock,
  Unlock,
  Activity,
  CheckCircle2,
} from 'lucide-react';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import PageLoader from '@shared/ui/PageLoader';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import { staffUsersService, type StaffUserDetail } from '../services/staffUsers.service';
import { extractErrorMessage } from '@shared/api/client';
import EditUserDrawer from '../components/users/EditUserDrawer';
import ChangeRoleDialog from '../components/users/ChangeRoleDialog';
import { ROUTES } from '../routes/routePaths';

export const UserDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user: currentUser, can } = useAuth();

  const [user, setUser] = useState<StaffUserDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [permSearch, setPermSearch] = useState('');

  // Drawers & Dialogs
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [isStatusConfirmOpen, setIsStatusConfirmOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isActionLoading, setIsActionLoading] = useState(false);

  const fetchUserDetails = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await staffUsersService.getById(id);
      setUser(data);
    } catch (err) {
      toast.error(extractErrorMessage(err));
      navigate(ROUTES.USERS);
    } finally {
      setIsLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchUserDetails();
  }, [fetchUserDetails]);

  const handleToggleStatus = async () => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      if (user.status === 'ACTIVE') {
        await staffUsersService.deactivate(user.id);
        toast.success(`Account for ${user.name} suspended. Sessions terminated.`);
      } else {
        await staffUsersService.activate(user.id);
        toast.success(`Account for ${user.name} reactivated.`);
      }
      setIsStatusConfirmOpen(false);
      fetchUserDetails();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      await staffUsersService.softDelete(user.id);
      toast.success(`Staff user ${user.name} deleted.`);
      setIsDeleteConfirmOpen(false);
      navigate(ROUTES.USERS);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!user) return;
    try {
      setIsActionLoading(true);
      await staffUsersService.resetPassword(user.id);
      toast.success(`Password reset email sent to ${user.email}`);
      setIsResetConfirmOpen(false);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center">
        <PageLoader variant="mascot" size="md" text="Loading user profile..." />
      </div>
    );
  }

  if (!user) return null;

  const isCurrent = currentUser?.id === user.id;
  const isSuperAdmin = user.roleKey === 'super_admin' || user.roles?.some((r) => r.key === 'super_admin');
  const hasWildcard = user.effectivePermissions?.includes('*') || isSuperAdmin;

  const filteredPerms = hasWildcard
    ? ['* (Unrestricted Root Privileges)']
    : (user.effectivePermissions || []).filter((p) =>
        p.toLowerCase().includes(permSearch.toLowerCase().trim()),
      );

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Navigation */}
      <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
        <Link to={ROUTES.USERS} className="hover:text-indigo-600 transition-colors flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" />
          Staff Directory
        </Link>
        <span>/</span>
        <span className="text-slate-800 font-semibold">{user.name}</span>
      </div>

      {/* Main Header Profile Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-700 font-bold text-xl flex items-center justify-center border-2 border-indigo-200 shrink-0 shadow-xs">
              {user.firstName?.[0] || user.name?.[0] || 'U'}
              {user.lastName?.[0] || ''}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold text-slate-900">{user.name}</h1>
                <span className="font-mono text-xs font-semibold px-2.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                  {user.userCode}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200">
                    Your Account
                  </span>
                )}
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  {user.email}
                </span>
                {user.designation && (
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-slate-400" />
                    {user.designation}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Joined {formatDateTime(user.createdAt)}
                </span>
              </div>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-wrap items-center gap-2">
            {can('users.edit') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditOpen(true)}
                leftIcon={<Edit2 className="w-3.5 h-3.5" />}
              >
                Edit Profile
              </Button>
            )}

            {can('roles.assign') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsRoleOpen(true)}
                leftIcon={<Shield className="w-3.5 h-3.5" />}
              >
                Change Role
              </Button>
            )}

            {can('users.activate') && !isCurrent && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsStatusConfirmOpen(true)}
                leftIcon={user.status === 'ACTIVE' ? <Lock className="w-3.5 h-3.5 text-amber-500" /> : <Unlock className="w-3.5 h-3.5 text-emerald-500" />}
              >
                {user.status === 'ACTIVE' ? 'Suspend' : 'Activate'}
              </Button>
            )}

            {can('users.edit') && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsResetConfirmOpen(true)}
                leftIcon={<KeyRound className="w-3.5 h-3.5" />}
              >
                Reset Password
              </Button>
            )}

            {can('users.delete') && !isCurrent && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => setIsDeleteConfirmOpen(true)}
                leftIcon={<Trash2 className="w-3.5 h-3.5" />}
              >
                Delete
              </Button>
            )}
          </div>
        </div>

        {/* Status badges bar */}
        <div className="mt-5 pt-5 border-t border-slate-100 flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Status:</span>
            {user.status === 'ACTIVE' ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Active
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                Suspended
              </span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Security:</span>
            {user.mfaEnabled ? (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                2FA Protected
              </span>
            ) : (
              <span className="text-xs text-amber-600 font-medium">2FA Not Configured</span>
            )}
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Role:</span>
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                isSuperAdmin
                  ? 'bg-purple-50 text-purple-700 border border-purple-200'
                  : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
              }`}
            >
              <Shield className="w-3 h-3" />
              {user.roleName}
            </span>
          </div>

          <div className="h-4 w-[1px] bg-slate-200" />

          <div className="text-xs text-slate-500">
            Last Active: <span className="text-slate-700 font-medium">{user.lastLoginAt ? formatDateTime(user.lastLoginAt) : 'Never'}</span>
          </div>
        </div>
      </div>

      {/* Grid: Permissions and Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Effective Permissions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Effective Permissions</h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Granular authorization capabilities resolved from assigned role(s).
                </p>
              </div>

              {!hasWildcard && (
                <input
                  type="text"
                  placeholder="Filter permissions..."
                  value={permSearch}
                  onChange={(e) => setPermSearch(e.target.value)}
                  className="px-3 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                />
              )}
            </div>

            <div className="mt-4">
              {hasWildcard ? (
                <div className="p-4 bg-purple-50 border border-purple-200 rounded-xl flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-purple-900">Unrestricted Wildcard Authority (*)</h4>
                    <p className="text-xs text-purple-700 mt-1 leading-relaxed">
                      As a Super Administrator, this user has full, unrestricted access to every administrative module, configuration policy, and sensitive platform operations.
                    </p>
                  </div>
                </div>
              ) : filteredPerms.length === 0 ? (
                <div className="text-center py-8 text-xs text-slate-400">
                  No matching permissions found.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
                  {filteredPerms.map((perm) => (
                    <div
                      key={perm}
                      className="p-2.5 rounded-lg bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-mono text-xs font-semibold text-slate-800">{perm}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Roles & Activity */}
        <div className="space-y-6">
          {/* Assigned Roles Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <h3 className="text-sm font-bold text-slate-900 mb-3">Assigned Role</h3>
            <div className="space-y-2">
              {user.roles && user.roles.length > 0 ? (
                user.roles.map((r) => (
                  <div
                    key={r.id}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <Shield className="w-3.5 h-3.5 text-indigo-600" />
                        <span className="text-xs font-bold text-slate-900">{r.name}</span>
                        {r.isSystem && (
                          <span className="text-[9px] font-semibold px-1 rounded bg-slate-200 text-slate-700">
                            System
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[10px] text-slate-400 mt-0.5">{r.key}</div>
                    </div>

                    <Link
                      to={`/roles/${r.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                    >
                      View Role
                    </Link>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400">No roles assigned.</div>
              )}
            </div>
          </div>

          {/* Recent Security Activity */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-slate-500" />
                Recent Activity
              </h3>
            </div>

            <div className="space-y-3">
              {user.recentActivity && user.recentActivity.length > 0 ? (
                user.recentActivity.map((act) => (
                  <div key={act.id} className="text-xs pb-3 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="font-semibold text-slate-800 capitalize">
                      {act.event.replace(/_/g, ' ').toLowerCase()}
                    </div>
                    <div className="text-[11px] text-slate-400 flex items-center justify-between mt-1">
                      <span>{formatDateTime(act.createdAt)}</span>
                      {act.ip && <span>{act.ip}</span>}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-400 py-3 text-center">No recorded activity logs yet.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Drawers & Dialogs */}
      <EditUserDrawer
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        user={user}
        onSuccess={fetchUserDetails}
      />

      <ChangeRoleDialog
        isOpen={isRoleOpen}
        onClose={() => setIsRoleOpen(false)}
        user={user}
        onSuccess={fetchUserDetails}
      />

      <ConfirmDialog
        isOpen={isStatusConfirmOpen}
        onClose={() => setIsStatusConfirmOpen(false)}
        onConfirm={handleToggleStatus}
        isLoading={isActionLoading}
        title={user.status === 'ACTIVE' ? 'Suspend Staff Account' : 'Reactivate Staff Account'}
        description={
          user.status === 'ACTIVE' ? (
            <span>
              Are you sure you want to suspend <strong>{user.name}</strong>? Active login sessions will be invalidated immediately.
            </span>
          ) : (
            <span>
              Reactivate console access for <strong>{user.name}</strong>?
            </span>
          )
        }
        tone={user.status === 'ACTIVE' ? 'warning' : 'primary'}
      />

      <ConfirmDialog
        isOpen={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
        onConfirm={handleDeleteUser}
        isLoading={isActionLoading}
        title="Delete Staff Member"
        description={
          <span>
            Are you sure you want to delete <strong>{user.name}</strong>? This action will revoke all sessions and mark the account soft-deleted.
          </span>
        }
        tone="danger"
      />

      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleResetPassword}
        isLoading={isActionLoading}
        title="Send Password Reset"
        description={
          <span>
            Send a password reset email link to <strong>{user.email}</strong>?
          </span>
        }
        tone="primary"
        confirmText="Send Reset Email"
      />
    </div>
  );
};

export default UserDetailsPage;
