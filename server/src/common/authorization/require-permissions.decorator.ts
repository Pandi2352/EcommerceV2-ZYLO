import { SetMetadata } from '@nestjs/common';
import type { PermissionKey } from '../../modules/permissions/catalog/permissions.catalog';

export const REQUIRE_PERMISSIONS_KEY = 'require_permissions';
export const REQUIRE_ANY_PERMISSION_KEY = 'require_any_permission';

/**
 * Requires ALL specified permissions to be granted on the actor's active roles.
 */
export const RequirePermissions = (...permissions: PermissionKey[]) =>
  SetMetadata(REQUIRE_PERMISSIONS_KEY, permissions);

/**
 * Requires AT LEAST ONE of the specified permissions to be granted.
 */
export const RequireAnyPermission = (...permissions: PermissionKey[]) =>
  SetMetadata(REQUIRE_ANY_PERMISSION_KEY, permissions);
