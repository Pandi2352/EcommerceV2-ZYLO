import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { generateToken, sha256 } from '../../../common/utils/crypto.util';
import { appConfig, AppConfig } from '../../../config/app.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { MailService } from '../../mail/mail.service';
import { verifyEmailTemplate } from '../../mail/templates/auth.templates';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { EMAIL_VERIFICATION_TTL_MS } from '../auth.constants';

@Injectable()
export class EmailVerificationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  /** Issue a fresh single-use link (any previous link stops working). */
  async sendVerification(user: UserDocument): Promise<void> {
    const token = generateToken();
    await this.usersService.update(user._id, {
      $set: {
        emailVerificationTokenHash: sha256(token),
        emailVerificationExpires: new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS),
      },
    });

    const url = `${this.app.clientUrl}/verify-email?token=${encodeURIComponent(token)}`;
    this.mailService.sendInBackground({ to: user.email, ...verifyEmailTemplate(this.app.name, user.name, url) });
  }

  async resend(user: UserDocument): Promise<void> {
    if (user.isEmailVerified) {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.EMAIL_ALREADY_VERIFIED, 'Your email address is already verified.');
    }
    await this.sendVerification(user);
  }

  async verify(token: string, meta: RequestMeta): Promise<UserDocument> {
    const user = await this.usersService.updateWhere(
      { emailVerificationTokenHash: sha256(token), emailVerificationExpires: { $gt: new Date() } },
      {
        $set: { isEmailVerified: true },
        $unset: { emailVerificationTokenHash: 1, emailVerificationExpires: 1 },
      },
    );
    if (!user) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
        'This verification link is invalid or has expired. Request a new one from your account.',
      );
    }

    await this.auditService.log({ event: AuditEvent.EMAIL_VERIFIED, subject: user, meta });
    return user;
  }
}
