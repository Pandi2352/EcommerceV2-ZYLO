import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { toDataURL } from 'qrcode';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { decrypt, encrypt } from '../../../common/utils/crypto.util';
import { appConfig, AppConfig } from '../../../config/app.config';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { MailService } from '../../mail/mail.service';
import { mfaStatusTemplate } from '../../mail/templates/auth.templates';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { PasswordService } from './password.service';
import { buildOtpauthUrl, generateTotpSecret, verifyTotp } from '../utils/totp.util';
import { generateBackupCodes, hashBackupCode } from '../utils/backup-codes.util';
import { DisableMfaDto } from '../dto/disable-mfa.dto';
import { MFA_BACKUP_CODE_COUNT } from '../auth.constants';

export type MfaMethod = 'totp' | 'backup_code';

export interface MfaSetupResult {
  secret: string;
  otpauthUrl: string;
  qrCodeDataUrl: string;
}

/** TOTP two-factor authentication: setup, verification, backup codes, disable. */
@Injectable()
export class MfaService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly mailService: MailService,
    private readonly auditService: AuditService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  /** Step 1: generate a secret the user scans; it only activates after `enable`. */
  async beginSetup(user: UserDocument): Promise<MfaSetupResult> {
    this.assertEnabled(user, false);
    const secret = generateTotpSecret();
    await this.usersService.update(user._id, {
      $set: { mfaPendingSecret: encrypt(secret, this.app.encryptionKey) },
    });

    const otpauthUrl = buildOtpauthUrl(this.app.name, user.email, secret);
    return { secret, otpauthUrl, qrCodeDataUrl: await toDataURL(otpauthUrl, { margin: 1, width: 220 }) };
  }

  /** Step 2: confirm the authenticator works, then switch MFA on and issue backup codes. */
  async enable(user: UserDocument, code: string, meta: RequestMeta): Promise<{ backupCodes: string[] }> {
    this.assertEnabled(user, false);
    const withSecret = await this.usersService.findById(user._id, ['mfaPendingSecret']);
    if (!withSecret?.mfaPendingSecret) {
      throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.MFA_SETUP_NOT_STARTED, 'Start two-factor setup first.');
    }

    const step = verifyTotp(decrypt(withSecret.mfaPendingSecret, this.app.encryptionKey), code.trim());
    if (step === null) {
      throw this.invalidCode();
    }

    const { codes, hashes } = generateBackupCodes(MFA_BACKUP_CODE_COUNT);
    await this.usersService.update(user._id, {
      $set: {
        mfaEnabled: true,
        mfaSecret: withSecret.mfaPendingSecret,
        mfaBackupCodeHashes: hashes,
        mfaLastUsedStep: step,
      },
      $unset: { mfaPendingSecret: 1 },
    });
    await this.notify(user, AuditEvent.MFA_ENABLED, meta, true);
    return { backupCodes: codes };
  }

  async disable(user: UserDocument, dto: DisableMfaDto, meta: RequestMeta): Promise<void> {
    this.assertEnabled(user, true);
    if (user.hasPassword) {
      const withHash = await this.usersService.findById(user._id, ['passwordHash']);
      if (!dto.password || !(await this.passwordService.verify(dto.password, withHash?.passwordHash))) {
        throw new AppException(HttpStatus.BAD_REQUEST, ErrorCode.PASSWORD_INCORRECT, 'Your password is incorrect.');
      }
    }
    if (!(await this.verifyCode(user, dto.code, meta))) {
      throw this.invalidCode();
    }

    await this.usersService.update(user._id, {
      $set: { mfaEnabled: false, mfaBackupCodeHashes: [] },
      $unset: { mfaSecret: 1, mfaPendingSecret: 1, mfaLastUsedStep: 1 },
    });
    await this.notify(user, AuditEvent.MFA_DISABLED, meta, false);
  }

  /** Replace all backup codes. Requires a current authenticator code (not a backup code). */
  async regenerateBackupCodes(user: UserDocument, code: string, meta: RequestMeta): Promise<{ backupCodes: string[] }> {
    this.assertEnabled(user, true);
    if ((await this.verifyCode(user, code, meta, false)) !== 'totp') {
      throw this.invalidCode();
    }

    const { codes, hashes } = generateBackupCodes(MFA_BACKUP_CODE_COUNT);
    await this.usersService.update(user._id, { $set: { mfaBackupCodeHashes: hashes } });
    await this.auditService.log({ event: AuditEvent.MFA_BACKUP_CODES_REGENERATED, subject: user, meta });
    return { backupCodes: codes };
  }

  /**
   * Check an authenticator code (each time step accepted once) or, when allowed,
   * consume a one-time backup code. Returns the method used, or null if invalid.
   */
  async verifyCode(user: UserDocument, rawCode: string, meta: RequestMeta, allowBackupCode = true): Promise<MfaMethod | null> {
    const code = rawCode.replace(/\s/g, '');

    if (/^\d{6}$/.test(code)) {
      const withSecret = await this.usersService.findById(user._id, ['mfaSecret']);
      if (!withSecret?.mfaSecret) return null;
      const step = verifyTotp(decrypt(withSecret.mfaSecret, this.app.encryptionKey), code);
      if (step === null) return null;
      // Atomic replay guard: only succeeds if this step is newer than the last accepted one
      const accepted = await this.usersService.updateWhere(
        { _id: user._id, $or: [{ mfaLastUsedStep: { $lt: step } }, { mfaLastUsedStep: { $exists: false } }] },
        { $set: { mfaLastUsedStep: step } },
      );
      return accepted ? 'totp' : null;
    }

    if (!allowBackupCode) return null;
    const hash = hashBackupCode(code);
    const consumed = await this.usersService.updateWhere(
      { _id: user._id, mfaBackupCodeHashes: hash },
      { $pull: { mfaBackupCodeHashes: hash } },
    );
    if (!consumed) return null;
    await this.auditService.log({ event: AuditEvent.MFA_BACKUP_CODE_USED, subject: user, meta });
    return 'backup_code';
  }

  private assertEnabled(user: UserDocument, expected: boolean): void {
    if (user.mfaEnabled === expected) return;
    throw expected
      ? new AppException(HttpStatus.BAD_REQUEST, ErrorCode.MFA_NOT_ENABLED, 'Two-factor authentication is not enabled.')
      : new AppException(HttpStatus.BAD_REQUEST, ErrorCode.MFA_ALREADY_ENABLED, 'Two-factor authentication is already enabled.');
  }

  private invalidCode(): AppException {
    return new AppException(HttpStatus.BAD_REQUEST, ErrorCode.MFA_INVALID_CODE, 'The verification code is invalid or was already used.');
  }

  private async notify(user: UserDocument, event: AuditEvent, meta: RequestMeta, enabled: boolean): Promise<void> {
    await this.auditService.log({ event, subject: user, meta });
    this.mailService.sendInBackground({ to: user.email, ...mfaStatusTemplate(this.app.name, user.name, enabled) });
  }
}
