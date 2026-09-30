import {
  Inject,
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { CookieOptions, Response } from 'express';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { authConfig, AuthConfig } from '../../config/auth.config';
import { TokenService, IssuedTokens } from './token.service';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './auth.constants';

export interface AuthResult {
  user: UserDocument;
  tokens: IssuedTokens;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly tokenService: TokenService,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  /**
   * Register a new customer account
   */
  async register(dto: RegisterDto): Promise<AuthResult> {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('An account with this email address already exists');
    }

    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(dto.password, salt);

    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash,
      role: UserRole.CUSTOMER,
      isActive: true,
      isEmailVerified: false,
    });

    return { user, tokens: await this.tokenService.issue(user, false) };
  }

  /**
   * Authenticate customer or admin credentials with Remember Me support
   */
  async login(dto: LoginDto): Promise<AuthResult> {
    const user = await this.usersService.findByEmailWithPassword(dto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('This account has been deactivated. Please contact support.');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    return { user, tokens: await this.tokenService.issue(user, Boolean(dto.rememberMe)) };
  }

  /**
   * Rotate the refresh token: the presented token is consumed and a new pair
   * is issued in the same session family.
   */
  async refresh(refreshToken: string): Promise<AuthResult> {
    const session = await this.tokenService.consume(refreshToken);

    const user = await this.usersService.findById(session.userId);
    if (!user || !user.isActive) {
      throw new UnauthorizedException('User session is invalid');
    }

    const tokens = await this.tokenService.issue(user, session.rememberMe, session.familyId);
    return { user, tokens };
  }

  /**
   * Revoke the refresh session server-side (the access token expires on its own)
   */
  async logout(refreshToken?: string): Promise<void> {
    if (refreshToken) {
      await this.tokenService.revoke(refreshToken);
    }
  }

  setAuthCookies(res: Response, tokens: IssuedTokens): void {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, this.cookieOptions(this.config.accessTtlMs));
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.cookieOptions(tokens.refreshTtlMs));
  }

  clearAuthCookies(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.cookieOptions());
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.cookieOptions());
  }

  private cookieOptions(maxAgeMs?: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      path: '/',
      ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
    };
  }
}
