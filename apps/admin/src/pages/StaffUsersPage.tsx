import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  UserCheck,
  UserX,
  ShieldCheck,
  Search,
  Plus,
  RefreshCw,
  Key,
  AlertTriangle,
} from 'lucide-react';
import { USER_ROLES, type UserRole, ROLE_LABELS } from '@shared/constants/roles';
import { formatDateTime } from '@shared/utils/format';
import Button from '@shared/ui/Button';
import Badge from '@shared/ui/Badge';
import SelectField from '@shared/ui/SelectField';
import ApiLoader from '@shared/ui/Spinner';
import { toast } from '@shared/ui/Toast';
import { staffService, type StaffUser, type StaffStats } from '../services/staff.service';
import InviteStaffModal from '../components/staff/InviteStaffModal';
import EditStaffModal from '../components/staff/EditStaffModal';

const ROLE_BADGE_STYLES: Record<UserRole, string> = {
  [USER_ROLES.SUPER_ADMIN]: 'bg-purple-50 text-purple-700 border-purple-200',
  [USER_ROLES.ADMIN]: 'bg-blue-50 text-blue-700 border-blue-200',
  [USER_ROLES.MANAGER]: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  [USER_ROLES.SUPPORT_AGENT]: 'bg-slate-100 text-slate-700 border-slate-200',
  [USER_ROLES.CUSTOMER]: 'bg-slate-100 text-slate-600 border-slate-200',
};

export const StaffUsersPage: React.FC = () => {
  const [users, setUsers] = useState<StaffUser[]>([]);
  const [stats, setStats] = useState<StaffStats>({
    totalStaff: 0,
    activeCount: 0,
    suspendedCount: 0,
    mfaEnabledCount: 0,
    rolesDistribution: {},
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<StaffUser | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await staffService.listStaff({
        search: search.trim() || undefined,
        role: selectedRole || undefined,
        isActive: selectedStatus === 'active' ? true : selectedStatus === 'suspended' ? false : undefined,
      });
      setUsers(res?.items ?? []);
      if (res?.stats) {
        setStats(res.stats);
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to load staff accounts';
      setError(msg);
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  }, [search, selectedRole, selectedStatus]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchUsers();
    }, 200);
    return () => clearTimeout(timer);
  }, [fetchUsers]);

  const handleToggleStatus = async (user: StaffUser) => {
    try {
      const nextStatus = !user.isActive;
      await staffService.updateStatus(user.id, nextStatus);
      toast.success(nextStatus ? `Reactivated ${user.name}` : `Suspended ${user.name}`);
      fetchUsers();
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to update account status');
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Invite Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Staff & Administrator Directory</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage console administrators, role assignments, and granular operational permissions.
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            onClick={fetchUsers}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />}
            className="py-2 text-xs"
          >
            Refresh
          </Button>
          <Button
            variant="primary"
            onClick={() => setInviteModalOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
            className="py-2 text-xs"
          >
            Invite Administrator
          </Button>
        </div>
      </div>

      {/* KPI Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Staff */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.totalStaff}</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-[#299cdb]/10 text-[#299cdb] flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        {/* Active Admins */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Active Admins</p>
            <p className="text-2xl font-bold text-emerald-600 mt-1">{stats.activeCount}</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <UserCheck className="w-5 h-5" />
          </div>
        </div>

        {/* Suspended Accounts */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Suspended</p>
            <p className="text-2xl font-bold text-rose-600 mt-1">{stats.suspendedCount}</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-rose-50 text-rose-600 flex items-center justify-center">
            <UserX className="w-5 h-5" />
          </div>
        </div>

        {/* 2FA Secured */}
        <div className="bg-white border border-slate-200/90 rounded-lg p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">2FA Protected</p>
            <p className="text-2xl font-bold text-indigo-600 mt-1">{stats.mfaEnabledCount}</p>
          </div>
          <div className="w-10 h-10 rounded-md bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white border border-slate-200/90 rounded-lg p-3.5 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <input
            type="text"
            placeholder="Search by administrator name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#f3f3f9] hover:bg-[#eaeaf3] focus:bg-white text-xs text-slate-800 placeholder:text-slate-400 placeholder:text-xs placeholder:font-normal rounded-md py-2 pl-9 pr-4 border border-transparent focus:border-slate-300 focus:outline-none transition-colors"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="w-44">
            <SelectField
              placeholder="All Roles"
              options={[
                { value: USER_ROLES.SUPER_ADMIN, label: 'Super Administrator' },
                { value: USER_ROLES.ADMIN, label: 'Administrator' },
                { value: USER_ROLES.MANAGER, label: 'Store Manager' },
                { value: USER_ROLES.SUPPORT_AGENT, label: 'Support Agent' },
              ]}
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>

          <div className="w-36">
            <SelectField
              placeholder="All Statuses"
              options={[
                { value: 'active', label: 'Active Only' },
                { value: 'suspended', label: 'Suspended Only' },
              ]}
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="py-1.5 text-xs"
            />
          </div>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-slate-200/90 rounded-lg overflow-hidden shadow-xs">
        {isLoading && users.length === 0 ? (
          <div className="p-8 flex justify-center">
            <ApiLoader text="Loading staff directory..." />
          </div>
        ) : error && users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800">Failed to load staff accounts</p>
            <p className="text-xs text-rose-600 max-w-sm mx-auto">{error}</p>
            <Button
              variant="primary"
              onClick={fetchUsers}
              leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
              className="py-1.5 text-xs mx-auto"
            >
              Retry Loading Staff
            </Button>
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-700">No staff members found</p>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Try adjusting your search filters or invite a new administrator to join your team.
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearch('');
                setSelectedRole('');
                setSelectedStatus('');
              }}
              className="py-1.5 text-xs"
            >
              Reset Filters
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Administrator</th>
                  <th className="py-3 px-4">Role</th>
                  <th className="py-3 px-4">Permissions</th>
                  <th className="py-3 px-4">2FA Security</th>
                  <th className="py-3 px-4">Last Login</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => {
                  const initial = u.name ? u.name.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase();
                  const customPermsCount = u.customPermissions?.length || 0;

                  return (
                    <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                      {/* User Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs shrink-0 border border-slate-200">
                            {initial}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-slate-800 truncate">{u.name || 'Staff Member'}</p>
                            <p className="text-[11px] text-slate-400 truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-semibold border ${
                            ROLE_BADGE_STYLES[u.role] || 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {ROLE_LABELS[u.role] || u.role}
                        </span>
                      </td>

                      {/* Permissions */}
                      <td className="py-3.5 px-4">
                        {customPermsCount > 0 ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-medium text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200/60">
                            <Key className="w-3 h-3" />
                            {customPermsCount} Custom
                          </span>
                        ) : (
                          <span className="text-[11px] text-slate-500">Role Standard</span>
                        )}
                      </td>

                      {/* 2FA */}
                      <td className="py-3.5 px-4">
                        {u.mfaEnabled ? (
                          <Badge tone="success">Protected</Badge>
                        ) : (
                          <Badge tone="neutral">Off</Badge>
                        )}
                      </td>

                      {/* Last Login */}
                      <td className="py-3.5 px-4 text-slate-500">
                        {u.lastLoginAt ? formatDateTime(u.lastLoginAt) : 'Never'}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {u.isActive ? (
                          <span className="inline-flex items-center gap-1.5 text-emerald-700 font-medium text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-emerald-500" />
                            Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-rose-700 font-medium text-[11px]">
                            <span className="w-2 h-2 rounded-full bg-rose-500" />
                            Suspended
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            onClick={() => setEditingUser(u)}
                            className="py-1 px-2.5 text-[11px]"
                          >
                            Edit
                          </Button>
                          <Button
                            variant={u.isActive ? 'ghost' : 'outline'}
                            onClick={() => handleToggleStatus(u)}
                            className={`py-1 px-2.5 text-[11px] ${
                              u.isActive ? 'text-rose-600 hover:bg-rose-50' : 'text-emerald-700 hover:bg-emerald-50'
                            }`}
                          >
                            {u.isActive ? 'Suspend' : 'Reactivate'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Invite Staff Modal */}
      <InviteStaffModal
        isOpen={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onInvited={() => {
          fetchUsers();
        }}
      />

      {/* Edit Staff Modal */}
      <EditStaffModal
        user={editingUser}
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        onUpdated={() => {
          fetchUsers();
        }}
      />
    </div>
  );
};

export default StaffUsersPage;
