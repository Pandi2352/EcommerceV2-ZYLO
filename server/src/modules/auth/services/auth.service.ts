import { HttpStatus, Injectable, UnauthorizedException } from '@nestjs/common';
import { RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { UserRole, isStaffRole } from '../../../common/enums/user-role.enum';
import { UsersService } from '../../users/users.service';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
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
  ) {}

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
