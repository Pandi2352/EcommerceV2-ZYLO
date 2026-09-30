import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../enums/user-role.enum';

export const ROLES_KEY = 'roles';

/**
 * Restrict a route to users whose role satisfies at least one of the given roles.
 * Staff roles are hierarchical: @Roles(UserRole.ADMIN) also admits SUPER_ADMIN.
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
