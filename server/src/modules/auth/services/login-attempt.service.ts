import { HttpStatus, Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { AuthPortal } from '../enums/auth-portal.enum';
import { LOCKOUT_DURATION_MS, MAX_FAILED_LOGIN_ATTEMPTS } from '../auth.constants';

/**
 * Tracks sign-in attempts: temporary lockout after repeated failures, and an
 * audit record (with IP and user agent) for every success and failure.
 */
@Injectable()
export class LoginAttemptService {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async assertNotLocked(user: UserDocument, portal: AuthPortal, meta: RequestMeta): Promise<void> {
    const lockedForMs = user.lockUntil ? user.lockUntil.getTime() - Date.now() : 0;
    if (lockedForMs <= 0) return;

    await this.auditService.log({ event: AuditEvent.LOGIN_BLOCKED_LOCKED, subject: user, portal, meta });
    const minutes = Math.ceil(lockedForMs / 60_000);
    throw new AppException(
      HttpStatus.LOCKED,
      ErrorCode.ACCOUNT_LOCKED,
      `Too many failed attempts. Your account is locked for ${minutes} more minute${minutes === 1 ? '' : 's'}.`,
      { retryAfterSeconds: Math.ceil(lockedForMs / 1000) },
    );
  }

  async recordFailure(
    user: UserDocument,
    portal: AuthPortal,
    meta: RequestMeta,
    event: AuditEvent = AuditEvent.LOGIN_FAILED,
  ): Promise<void> {
    const updated = await this.usersService.update(user._id, { $inc: { failedLoginAttempts: 1 } });
    await this.auditService.log({ event, subject: user, portal, meta });

    if (updated.failedLoginAttempts >= MAX_FAILED_LOGIN_ATTEMPTS) {
      await this.usersService.update(user._id, {
        $set: { failedLoginAttempts: 0, lockUntil: new Date(Date.now() + LOCKOUT_DURATION_MS) },
      });
      await this.auditService.log({ event: AuditEvent.ACCOUNT_LOCKED, subject: user, portal, meta });
    }
  }

  async recordUnknownAccount(email: string, portal: AuthPortal, meta: RequestMeta): Promise<void> {
    await this.auditService.log({
      event: AuditEvent.LOGIN_FAILED,
      email,
      portal,
      meta,
      metadata: { reason: 'unknown_account' },
    });
  }

  async recordSuccess(user: UserDocument, portal: AuthPortal, meta: RequestMeta): Promise<void> {
    await this.usersService.update(user._id, {
      $set: { failedLoginAttempts: 0, lockUntil: null, lastLoginAt: new Date() },
    });
    await this.auditService.log({ event: AuditEvent.LOGIN_SUCCESS, subject: user, portal, meta });
  }
}
