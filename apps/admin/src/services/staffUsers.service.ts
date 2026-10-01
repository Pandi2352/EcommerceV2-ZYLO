import { api, unwrap } from '@shared/api/client';
import type { PermissionKey } from '@shared/constants/permissionKeys';

export interface StaffUserItem {
  id: string;
  name: string;
  firstName?: string;
  lastName?: string;
  email: string;
  userCode: string;
  designation?: string;
  accountType: 'STAFF' | 'CUSTOMER';
  roleIds: string[];
  roleName: string;
  roleKey: string;
  status: 'ACTIVE' | 'INACTIVE';
  isActive: boolean;
  isLocked: boolean;
  mfaEnabled: boolean;
  lastLoginAt?: string;
  createdAt: string;
}

export interface StaffUserStats {
  totalStaff: number;
  activeCount: number;
  inactiveCount: number;
  mfaEnabledCount: number;
}

export interface StaffUsersResponse {
  items: StaffUserItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  stats: StaffUserStats;
}

export interface StaffUsersQuery {
  page?: number;
  limit?: number;
  status?: string;
  roleId?: string;
  designation?: string;
  q?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface StaffUserDetail extends StaffUserItem {
  roles: { id: string; name: string; key: string; isSystem: boolean }[];
  effectivePermissions: (PermissionKey | string)[];
  recentActivity: {
    id: string;
    event: string;
    ip?: string;
    createdAt: string;
    metadata?: Record<string, any>;
  }[];
}

export interface UpdateStaffProfilePayload {
  firstName?: string;
  lastName?: string;
  designation?: string;
  userCode?: string;
}

export const staffUsersService = {
  list: (query: StaffUsersQuery = {}) => {
    const params = Object.fromEntries(
      Object.entries(query).filter(([, v]) => v !== undefined && v !== ''),
    );
    return unwrap<StaffUsersResponse>(api.get('/admin/users', { params }));
  },

  getById: (id: string) => {
    return unwrap<StaffUserDetail>(api.get(`/admin/users/${id}`));
  },

  updateProfile: (id: string, payload: UpdateStaffProfilePayload) => {
    return unwrap<StaffUserItem>(api.patch(`/admin/users/${id}`, payload));
  },

  assignRoles: (id: string, roleIds: string[]) => {
    return unwrap<{ success: boolean; user: StaffUserItem }>(
      api.put(`/admin/users/${id}/roles`, { roleIds }),
    );
  },

  activate: (id: string) => {
    return unwrap<{ success: boolean; message: string }>(api.post(`/admin/users/${id}/activate`));
  },

  deactivate: (id: string) => {
    return unwrap<{ success: boolean; message: string }>(api.post(`/admin/users/${id}/deactivate`));
  },

  softDelete: (id: string) => {
    return unwrap<{ success: boolean; message: string }>(api.delete(`/admin/users/${id}`));
  },

  resetPassword: (id: string) => {
    return unwrap<{ success: boolean; message: string }>(api.post(`/admin/users/${id}/reset-password`));
  },
};
