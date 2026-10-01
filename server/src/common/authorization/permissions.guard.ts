import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';
import { REQUIRE_PERMISSIONS_KEY, REQUIRE_ANY_PERMISSION_KEY } from './require-permissions.decorator';
import { ALLOW_ANY_STAFF_KEY } from './account-type.decorator';
import { PermissionResolverService } from './permission-resolver.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly permissionResolver: PermissionResolverService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    if (!user) {
      return true;
    }

    // Resolve user's effective permissions and attach to user on request
    const roleIds: string[] = user.roleIds || [];
    const { permissions: effectivePermissions, roles } = await this.permissionResolver.forUser(roleIds);
    request.user.permissions = effectivePermissions;
    request.user.roles = roles;

    // Check required permissions
    const requiredAll = this.reflector.getAllAndOverride<string[]>(REQUIRE_PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredAny = this.reflector.getAllAndOverride<string[]>(REQUIRE_ANY_PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const allowAnyStaff = this.reflector.getAllAndOverride<boolean>(ALLOW_ANY_STAFF_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no permission decorator is present:
    if (!requiredAll && !requiredAny) {
      return true;
    }

    // If user is super_admin (or holds '*'), allow
    if (effectivePermissions.includes('*')) {
      return true;
    }

    // Verify all required permissions
    if (requiredAll && requiredAll.length > 0) {
      const hasAll = requiredAll.every((perm) => effectivePermissions.includes(perm));
      if (!hasAll) {
        throw new ForbiddenException({
          code: 'PERMISSION_DENIED',
          message: 'You do not have the required permissions to perform this action',
          required: requiredAll,
        });
      }
    }

    // Verify at least one required permission
    if (requiredAny && requiredAny.length > 0) {
      const hasAny = requiredAny.some((perm) => effectivePermissions.includes(perm));
      if (!hasAny) {
        throw new ForbiddenException({
          code: 'PERMISSION_DENIED',
          message: 'You do not have the required permissions to perform this action',
          required: requiredAny,
        });
      }
    }

    return true;
  }
}
