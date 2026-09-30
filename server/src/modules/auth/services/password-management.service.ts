import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { generateToken, sha256 } from '../../../common/utils/crypto.util';
import { isStaffRole } from '../../../common/enums/user-role.enum';
import { appConfig, AppConfig } from '../../../config/app.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { MailService } from '../../mail/mail.service';
import { passwordChangedTemplate, passwordResetTemplate } from '../../mail/templates/auth.templates';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { PasswordService } from './password.service';
import { TokenService } from './token.service';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { PASSWORD_RESET_TTL_MS } from '../auth.constants';

/** Forgot-password, reset-by-link and authenticated password change flows. */
@Injectable()
export class PasswordManagementService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  /** Always completes silently so the response never reveals whether the email is registered. */
  async requestReset(email: string, meta: RequestMeta): Promise<void> {
    const user = await this.usersService.findByEmail(email);
    await this.auditService.log({
      event: AuditEvent.PASSWORD_RESET_REQUESTED,
      subject: user,
      email,
      meta,
      metadata: { accountFound: Boolean(user) },
    });
    if (!user || !user.isActive) return;

    const token = generateToken();
    await this.usersService.update(user._id, {
      $set: {
        passwordResetTokenHash: sha256(token),
        passwordResetExpires: new Date(Date.now() + PASSWORD_RESET_TTL_MS),
      },
    });

    // Staff reset their password in the admin console, customers on the storefront
    const origin = isStaffRole(user.role) ? this.app.adminUrl : this.app.clientUrl;
    const url = `${origin}/reset-password?token=${encodeURIComponent(token)}`;
    this.mailService.sendInBackground({ to: user.email, ...passwordResetTemplate(this.app.name, user.name, url) });
  }

  async resetPassword(dto: ResetPasswordDto, meta: RequestMeta): Promise<void> {
    const user = await this.usersService.findOne(
      { passwordResetTokenHash: sha256(dto.token), passwordResetExpires: { $gt: new Date() } },
      ['passwordHash', 'previousPasswordHash'],
    );
    if (!user) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
        'This password reset link is invalid or has expired. Please request a new one.',
      );
    }

    await this.passwordService.assertNotReused(user, dto.password);
    // Following the emailed link proves ownership of the address
    await this.passwordService.setPassword(user, dto.password, { isEmailVerified: true });
    await this.afterPasswordChange(user, AuditEvent.PASSWORD_RESET_COMPLETED, meta);
  }

  /** Change password while signed in. All sessions are revoked; the caller re-issues one. */
  async changePassword(userId: string, dto: ChangePasswordDto, meta: RequestMeta): Promise<UserDocument> {
    const user = await this.usersService.findById(userId, ['passwordHash', 'previousPasswordHash']);
    if (!user?.passwordHash) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.PASSWORD_NOT_SET,
        'Your account does not have a password yet. Use "Forgot password" to set one.',
      );
    }
    if (!(await this.passwordService.verify(dto.currentPassword, user.passwordHash))) {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.PASSWORD_INCORRECT, 'Your current password is incorrect.');
    }

    await this.passwordService.assertNotReused(user, dto.newPassword);
    const updated = await this.passwordService.setPassword(user, dto.newPassword);
    await this.afterPasswordChange(user, AuditEvent.PASSWORD_CHANGED, meta);
    return updated;
  }

  private async afterPasswordChange(user: UserDocument, event: AuditEvent, meta: RequestMeta): Promise<void> {
    await this.tokenService.revokeAllForUser(user._id);
    await this.auditService.log({ event, subject: user, meta });
    this.mailService.sendInBackground({ to: user.email, ...passwordChangedTemplate(this.app.name, user.name) });
  }
}
