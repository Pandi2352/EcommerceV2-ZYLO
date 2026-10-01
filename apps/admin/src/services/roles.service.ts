import { api, unwrap } from '@shared/api/client';
import type { PermissionKey } from '@shared/constants/permissionKeys';

export interface Role {
  id: string;
  name: string;
  key: string;
  description?: string;
  permissions: (PermissionKey | string)[];
  isSystem: boolean;
  status: 'ACTIVE' | 'INACTIVE';
  userCount?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface RoleListResponse {
  items: Role[];
  total: number;
}

export interface CreateRolePayload {
  name: string;
  key: string;
  description?: string;
  permissions: (PermissionKey | string)[];
}

export interface UpdateRolePayload {
  name?: string;
  description?: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface AssignPermissionsPayload {
  permissions: (PermissionKey | string)[];
  reason?: string;
}

export interface RoleUserItem {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  userCode: string;
  designation?: string;
  status: 'ACTIVE' | 'INACTIVE';
  joinedAt: string;
}

export const rolesService = {
  listRoles: () => {
    return unwrap<RoleListResponse>(api.get('/admin/roles'));
  },

  getRoleById: (id: string) => {
    return unwrap<Role>(api.get(`/admin/roles/${id}`));
  },

  createRole: (payload: CreateRolePayload) => {
    return unwrap<Role>(api.post('/admin/roles', payload));
  },

  updateRole: (id: string, payload: UpdateRolePayload) => {
    return unwrap<Role>(api.patch(`/admin/roles/${id}`, payload));
  },

  assignPermissions: (id: string, payload: AssignPermissionsPayload) => {
    return unwrap<Role>(api.put(`/admin/roles/${id}/permissions`, payload));
  },

  getRoleUsers: (id: string) => {
    return unwrap<RoleUserItem[]>(api.get(`/admin/roles/${id}/users`));
  },

  deleteRole: (id: string) => {
    return unwrap<{ success: boolean; message: string }>(api.delete(`/admin/roles/${id}`));
  },
};
