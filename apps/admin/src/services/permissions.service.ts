import { api, unwrap } from '@shared/api/client';
import type { PermissionKey } from '@shared/constants/permissionKeys';

export interface PermissionDefinition {
  key: PermissionKey | string;
  action: string;
  name: string;
  description: string;
  isSensitive: boolean;
  sortOrder: number;
}

export interface ModulePermissions {
  module: string;
  permissions: PermissionDefinition[];
}

export interface GroupedPermissionDomain {
  group: string;
  modules: ModulePermissions[];
}

export const permissionsService = {
  getGroupedPermissions: () => {
    return unwrap<GroupedPermissionDomain[]>(api.get('/admin/permissions'));
  },
};
