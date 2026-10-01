import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ACCOUNT_TYPE_KEY } from './account-type.decorator';
import { AccountType } from '../enums/account-type.enum';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class AccountTypeGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const requiredType = this.reflector.getAllAndOverride<AccountType>(ACCOUNT_TYPE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (!requiredType) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException({
        code: 'UNAUTHENTICATED',
        message: 'Authentication required',
      });
    }

    // Support both accountType field and legacy staff role fallback during migration
    const userAccountType = user.accountType || (user.role && user.role !== 'CUSTOMER' ? AccountType.STAFF : AccountType.CUSTOMER);

    if (userAccountType !== requiredType) {
      throw new ForbiddenException({
        code: 'PERMISSION_DENIED',
        message: `This resource requires ${requiredType.toLowerCase()} access`,
      });
    }

    return true;
  }
}
