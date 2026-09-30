import { HttpStatus, Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { UserRole, isStaffRole } from '../../../common/enums/user-role.enum';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';

/** Normalised identity returned by GoogleStrategy.validate */
export interface GoogleProfile {
  googleId: string;
  email?: string;
  emailVerified: boolean;
  name: string;
  avatarUrl?: string;
}

/**
 * Maps a Google identity to a local account: an existing linked account, an
 * existing customer with the same verified email (linked automatically), or a
 * new customer account.
 */
@Injectable()
export class GoogleOAuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditService: AuditService,
  ) {}

  async resolveUser(profile: GoogleProfile, meta: RequestMeta): Promise<UserDocument> {
    const linked = await this.usersService.findOne({ googleId: profile.googleId });
    if (linked) return linked;

    if (!profile.email || !profile.emailVerified) {
      throw new AppException(
        HttpStatus.FORBIDDEN,
        ErrorCode.OAUTH_EMAIL_UNVERIFIED,
        'Your Google account email is not verified.',
      );
    }

    const existing = await this.usersService.findByEmail(profile.email);
    if (existing) {
      // Staff accounts must keep using password + MFA through the admin portal
      if (isStaffRole(existing.role)) {
        throw new AppException(
          HttpStatus.FORBIDDEN,
          ErrorCode.OAUTH_STAFF_NOT_ALLOWED,
          'Staff accounts cannot sign in with Google.',
        );
      }
      const user = await this.usersService.update(existing._id, {
        $set: {
          googleId: profile.googleId,
          isEmailVerified: true,
          ...(existing.avatarUrl || !profile.avatarUrl ? {} : { avatarUrl: profile.avatarUrl }),
        },
      });
      await this.auditService.log({ event: AuditEvent.OAUTH_ACCOUNT_LINKED, subject: user, meta, metadata: { provider: 'google' } });
      return user;
    }

    const user = await this.usersService.create({
      name: profile.name,
      email: profile.email,
      googleId: profile.googleId,
      avatarUrl: profile.avatarUrl,
      role: UserRole.CUSTOMER,
      hasPassword: false,
      isEmailVerified: true,
    });
    await this.auditService.log({ event: AuditEvent.OAUTH_ACCOUNT_CREATED, subject: user, meta, metadata: { provider: 'google' } });
    return user;
  }
}
