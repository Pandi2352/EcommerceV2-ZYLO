import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  ShieldAlert,
  ShieldCheck,
  Plus,
  Users,
  Key,
  Trash2,
  ExternalLink,
  RefreshCw,
  Lock,
} from 'lucide-react';
import Button from '@shared/ui/Button';
import PageLoader from '@shared/ui/PageLoader';
import ConfirmDialog from '@shared/ui/ConfirmDialog';
import { toast } from '@shared/ui/Toast';
import { useAuth } from '@shared/auth/AuthContext';
import { rolesService, type Role } from '../services/roles.service';
import { extractErrorMessage } from '@shared/api/client';
import CreateRoleDrawer from '../components/roles/CreateRoleDrawer';

export const RolesPage: React.FC = () => {
  const { can } = useAuth();

  const [roles, setRoles] = useState<Role[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [deleteRoleItem, setDeleteRoleItem] = useState<Role | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchRoles = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await rolesService.listRoles();
      setRoles(res.items);
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRoles();
  }, [fetchRoles]);

  const handleDeleteRole = async () => {
    if (!deleteRoleItem) return;
    try {
      setIsDeleting(true);
      await rolesService.deleteRole(deleteRoleItem.id);
      toast.success(`Role "${deleteRoleItem.name}" deleted successfully.`);
      setDeleteRoleItem(null);
      fetchRoles();
    } catch (err) {
      toast.error(extractErrorMessage(err));
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Roles & Permissions</h1>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {roles.length} Roles
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Configure system roles, create custom departmental authority profiles, and manage granular permissions.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchRoles}
            leftIcon={<RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />}
          >
            Refresh
          </Button>

          {can('roles.create') && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              leftIcon={<Plus className="w-4 h-4" />}
            >
              Create Role
            </Button>
          )}
        </div>
      </div>

      {/* Roles Grid */}
      {isLoading ? (
        <div className="p-12 text-center bg-white rounded-2xl border border-slate-200/80">
          <PageLoader variant="mascot" size="md" text="Loading roles and permissions..." />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {roles.map((role) => {
            const isSuperAdmin = role.key === 'super_admin';
            const hasWildcard = role.permissions.includes('*') || isSuperAdmin;
            const canDelete = !role.isSystem && (role.userCount ?? 0) === 0 && can('roles.delete');

            return (
              <div
                key={role.id}
                className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                          isSuperAdmin
                            ? 'bg-purple-100 text-purple-700'
                            : role.isSystem
                            ? 'bg-indigo-50 text-indigo-700'
                            : 'bg-emerald-50 text-emerald-700'
                        }`}
                      >
                        {isSuperAdmin ? (
                          <ShieldAlert className="w-5 h-5" />
                        ) : role.isSystem ? (
                          <ShieldCheck className="w-5 h-5" />
                        ) : (
                          <Shield className="w-5 h-5" />
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900 leading-tight">
                          {role.name}
                        </h3>
                        <div className="font-mono text-[11px] text-slate-400 mt-0.5">
                          {role.key}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {role.isSystem ? (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1">
                          <Lock className="w-2.5 h-2.5" />
                          System
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          Custom
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 leading-relaxed min-h-[36px] line-clamp-2 mb-4">
                    {role.description || 'Pre-configured access controls and system authorization rules.'}
                  </p>

                  <div className="grid grid-cols-2 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Users className="w-3.5 h-3.5 text-slate-400" />
                      <span className="font-bold text-slate-800">{role.userCount ?? 0}</span>
                      <span>members</span>
                    </div>

                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Key className="w-3.5 h-3.5 text-slate-400" />
                      {hasWildcard ? (
                        <span className="font-bold text-purple-700">Root (*)</span>
                      ) : (
                        <>
                          <span className="font-bold text-slate-800">{role.permissions.length}</span>
                          <span>perms</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="px-5 py-3 bg-slate-50/80 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    to={`/roles/${role.id}`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Configure Permissions</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </Link>

                  {canDelete && (
                    <button
                      type="button"
                      onClick={() => setDeleteRoleItem(role)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                      title="Delete Custom Role"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create Role Drawer */}
      <CreateRoleDrawer
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSuccess={fetchRoles}
        existingRoles={roles}
      />

      {/* Delete Role Confirm Dialog */}
      <ConfirmDialog
        isOpen={!!deleteRoleItem}
        onClose={() => setDeleteRoleItem(null)}
        onConfirm={handleDeleteRole}
        isLoading={isDeleting}
        title="Delete Custom Role"
        description={
          <span>
            Are you sure you want to delete role <strong>"{deleteRoleItem?.name}"</strong>? This action cannot be undone.
          </span>
        }
        tone="danger"
        confirmText="Delete Role"
      />
    </div>
  );
};

export default RolesPage;
