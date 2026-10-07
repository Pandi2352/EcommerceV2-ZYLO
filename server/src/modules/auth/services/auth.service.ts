import { HttpStatus, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { sha256 } from '../../../common/utils/crypto.util';
import { appConfig, AppConfig } from '../../../config/app.config';
import { UserRole, isStaffRole } from '../../../common/enums/user-role.enum';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { MailService } from '../../mail/mail.service';
import { registrationOtpTemplate } from '../../mail/templates/auth.templates';
import { RegistrationOtp, RegistrationOtpDocument } from '../schemas/registration-otp.schema';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { VerifyRegistrationOtpDto } from '../dto/verify-registration-otp.dto';
import { AuthPortal } from '../enums/auth-portal.enum';
import { LoginOutcome } from '../interfaces/login-outcome.interface';
import { TokenService, IssuedTokens } from './token.service';
import { PasswordService } from './password.service';
import { LoginAttemptService } from './login-attempt.service';
import { MfaService } from './mfa.service';
import { MfaChallengeService } from './mfa-challenge.service';
import { EmailVerificationService } from './email-verification.service';

/** Orchestrates sign-up, sign-in (password, MFA, OAuth), session refresh and sign-out. */
@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly passwordService: PasswordService,
    private readonly tokenService: TokenService,
    private readonly loginAttempts: LoginAttemptService,
    private readonly mfaService: MfaService,
    private readonly mfaChallenge: MfaChallengeService,
    private readonly emailVerification: EmailVerificationService,
    private readonly auditService: AuditService,
    private readonly mailService: MailService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    @InjectModel(RegistrationOtp.name) private readonly otpModel: Model<RegistrationOtpDocument>,
  ) {}

  async sendRegistrationOtp(
    email: string,
    meta: RequestMeta,
  ): Promise<{ message: string; cooldownSeconds: number; previewOtp?: string }> {
    const normalizedEmail = email.toLowerCase().trim();

    // Check if account already exists
    const existingUser = await this.usersService.findByEmail(normalizedEmail);
    if (existingUser) {
      throw new AppException(
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_TAKEN,
        'An account with this email address already exists. Please sign in instead.',
      );
    }

    // Rate-limit check: enforce 60 seconds cooldown between OTP requests
    const existingOtp = await this.otpModel.findOne({ email: normalizedEmail }).exec();
    if (existingOtp && existingOtp.lastSentAt) {
      const elapsedMs = Date.now() - new Date(existingOtp.lastSentAt).getTime();
      const cooldownMs = 60 * 1000;
      if (elapsedMs < cooldownMs) {
        const remainingSeconds = Math.ceil((cooldownMs - elapsedMs) / 1000);
        throw new AppException(
          HttpStatus.TOO_MANY_REQUESTS,
          ErrorCode.TOO_MANY_REQUESTS,
          `Please wait ${remainingSeconds} seconds before requesting a new OTP.`,
        );
      }
    }

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpHash = sha256(otp);

    await this.otpModel.findOneAndUpdate(
      { email: normalizedEmail },
      {
        email: normalizedEmail,
        otpHash,
        expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes expiry
        lastSentAt: new Date(),
        attempts: 0,
      },
      { upsert: true, returnDocument: 'after' },
    );

    // Send email with OTP
    this.mailService.sendInBackground({
      to: normalizedEmail,
      ...registrationOtpTemplate(this.app.name, otp),
    });

    return {
      message: 'A verification code has been sent to your email.',
      cooldownSeconds: 60,
      previewOtp: process.env.NODE_ENV !== 'production' ? otp : undefined,
    };
  }

  async verifyRegistrationOtp(
    dto: VerifyRegistrationOtpDto,
    meta: RequestMeta,
  ): Promise<LoginOutcome> {
    const normalizedEmail = dto.email.toLowerCase().trim();

    // Double check email collision
    if (await this.usersService.findByEmail(normalizedEmail)) {
      throw new AppException(
        HttpStatus.CONFLICT,
        ErrorCode.EMAIL_TAKEN,
        'An account with this email address already exists. Please sign in instead.',
      );
    }

    const otpRecord = await this.otpModel.findOne({ email: normalizedEmail }).exec();
    if (!otpRecord || otpRecord.expiresAt < new Date()) {
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
        'Your verification code has expired or was not requested. Please request a new OTP.',
      );
    }

    if (otpRecord.attempts >= 5) {
      throw new AppException(
        HttpStatus.TOO_MANY_REQUESTS,
        ErrorCode.TOO_MANY_REQUESTS,
        'Too many failed attempts. Please request a new verification code.',
      );
    }

    if (sha256(dto.otp.trim()) !== otpRecord.otpHash) {
      await this.otpModel.updateOne({ _id: otpRecord._id }, { $inc: { attempts: 1 } });
      throw new AppException(
        HttpStatus.BAD_REQUEST,
        ErrorCode.INVALID_TOKEN,
        'The verification code is incorrect. Please check your email and try again.',
      );
    }

    // OTP is valid! Delete the consumed OTP record
    await this.otpModel.deleteOne({ _id: otpRecord._id });

    // Create verified customer user
    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: normalizedEmail,
      passwordHash: await this.passwordService.hash(dto.password),
      passwordChangedAt: new Date(Date.now() - 1000),
      role: UserRole.CUSTOMER,
      isEmailVerified: true, // Verified instantly via OTP!
    });

    await this.auditService.log({ event: AuditEvent.USER_CREATED, subject: user, meta });
    await this.auditService.log({ event: AuditEvent.EMAIL_VERIFIED, subject: user, meta });
    await this.loginAttempts.recordSuccess(user, AuthPortal.CUSTOMER, meta);

    return { mfaRequired: false, user, tokens: await this.tokenService.issue(user, false) };
  }

  async register(dto: RegisterDto, meta: RequestMeta): Promise<LoginOutcome> {
    if (await this.usersService.findByEmail(dto.email)) {
      throw new AppException(HttpStatus.CONFLICT, ErrorCode.EMAIL_TAKEN, 'An account with this email address already exists');
    }

    const user = await this.usersService.create({
      name: dto.name.trim(),
      email: dto.email.toLowerCase(),
      passwordHash: await this.passwordService.hash(dto.password),
      passwordChangedAt: new Date(Date.now() - 1000),
      role: UserRole.CUSTOMER,
    });
    await this.emailVerification.sendVerification(user);
    await this.loginAttempts.recordSuccess(user, AuthPortal.CUSTOMER, meta);

    return { mfaRequired: false, user, tokens: await this.tokenService.issue(user, false) };
  }

  /** First factor: email + password, scoped to the portal the user signs in from. */
  async login(dto: LoginDto, portal: AuthPortal, meta: RequestMeta): Promise<LoginOutcome> {
    const user = await this.usersService.findByEmail(dto.email, ['passwordHash']);
    if (!user) {
      await this.passwordService.verify(dto.password, undefined);
      await this.loginAttempts.recordUnknownAccount(dto.email, portal, meta);
      throw this.invalidCredentials();
    }

    await this.loginAttempts.assertNotLocked(user, portal, meta);
    if (!(await this.passwordService.verify(dto.password, user.passwordHash))) {
      await this.loginAttempts.recordFailure(user, portal, meta);
      throw this.invalidCredentials();
    }

    this.assertCanSignIn(user, portal);
    return this.beginSession(user, Boolean(dto.rememberMe), portal, meta);
  }

  /** First factor via an OAuth provider (customer storefront only). */
  async loginWithOAuth(user: UserDocument, rememberMe: boolean, meta: RequestMeta): Promise<LoginOutcome> {
    this.assertCanSignIn(user, AuthPortal.CUSTOMER);
    return this.beginSession(user, rememberMe, AuthPortal.CUSTOMER, meta);
  }

  /** Second factor: authenticator or backup code for a pending MFA challenge. */
  async completeMfa(challengeToken: string | undefined, code: string, meta: RequestMeta): Promise<LoginOutcome> {
    const challenge = await this.mfaChallenge.verify(challengeToken);
    const user = await this.usersService.findById(challenge.sub);
    if (!user?.isActive || !user.mfaEnabled) {
      throw new AppException(HttpStatus.UNAUTHORIZED, ErrorCode.MFA_CHALLENGE_INVALID, 'Your sign-in attempt expired. Please sign in again.');
    }

    await this.loginAttempts.assertNotLocked(user, challenge.portal, meta);
    if (!(await this.mfaService.verifyCode(user, code, meta))) {
      await this.loginAttempts.recordFailure(user, challenge.portal, meta, AuditEvent.MFA_CHALLENGE_FAILED);
      throw new AppException(HttpStatus.UNAUTHORIZED, ErrorCode.MFA_INVALID_CODE, 'The verification code is invalid or was already used.');
    }

    await this.loginAttempts.recordSuccess(user, challenge.portal, meta);
    return { mfaRequired: false, user, tokens: await this.tokenService.issue(user, challenge.rememberMe) };
  }

  /** Rotate the refresh token: consume the presented one and issue a new pair in the same family. */
  async refresh(refreshToken: string): Promise<{ user: UserDocument; tokens: IssuedTokens }> {
    const session = await this.tokenService.consume(refreshToken);
    const user = await this.usersService.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User session is invalid');
    }
    return { user, tokens: await this.tokenService.issue(user, session.rememberMe, session.familyId) };
  }

  /** Whether the session behind a refresh token was created with "remember me". */
  async isSessionRemembered(refreshToken: string | undefined): Promise<boolean> {
    return (await this.tokenService.peek(refreshToken))?.rememberMe ?? false;
  }

  /** Fresh session for the current device (e.g. after a password change revoked all sessions). */
  issueSession(user: UserDocument, rememberMe: boolean): Promise<IssuedTokens> {
    return this.tokenService.issue(user, rememberMe);
  }

  async logout(refreshToken: string | undefined, meta: RequestMeta): Promise<void> {
    if (!refreshToken) return;
    const userId = await this.tokenService.revoke(refreshToken);
    if (userId) {
      await this.auditService.log({ event: AuditEvent.LOGOUT, subject: { _id: userId }, meta });
    }
  }

  async logoutAll(user: UserDocument, meta: RequestMeta): Promise<void> {
    await this.tokenService.revokeAllForUser(user._id);
    await this.auditService.log({ event: AuditEvent.LOGOUT_ALL, subject: user, meta });
  }

  private async beginSession(user: UserDocument, rememberMe: boolean, portal: AuthPortal, meta: RequestMeta): Promise<LoginOutcome> {
    if (user.mfaEnabled) {
      return { mfaRequired: true, user, challengeToken: await this.mfaChallenge.create(user, rememberMe, portal) };
    }
    await this.loginAttempts.recordSuccess(user, portal, meta);
    return { mfaRequired: false, user, tokens: await this.tokenService.issue(user, rememberMe) };
  }

  /** Staff sign in through the admin portal only; customers through the storefront only. */
  private assertCanSignIn(user: UserDocument, portal: AuthPortal): void {
    if (!user.isActive) {
      throw new AppException(HttpStatus.FORBIDDEN, ErrorCode.ACCOUNT_DISABLED, 'This account has been deactivated. Please contact support.');
    }
    const staff = isStaffRole(user.role);
    if (portal === AuthPortal.ADMIN && !staff) {
      throw new AppException(HttpStatus.FORBIDDEN, ErrorCode.WRONG_PORTAL, 'This account does not have access to the admin portal.');
    }
    if (portal === AuthPortal.CUSTOMER && staff) {
      throw new AppException(HttpStatus.FORBIDDEN, ErrorCode.WRONG_PORTAL, 'Staff accounts must sign in through the admin portal.');
    }
  }

  private invalidCredentials(): AppException {
    return new AppException(HttpStatus.UNAUTHORIZED, ErrorCode.INVALID_CREDENTIALS, 'Invalid email or password');
  }
}
