import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { User, UserDocument, UserRole } from '../users/schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { authConfig } from '../../config/auth.config';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResult {
  user: UserDocument;
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
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

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Authenticate customer or admin credentials
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

    const tokens = await this.generateTokens(user);

    return {
      user,
      ...tokens,
    };
  }

  /**
   * Refresh session access token using a valid refresh token
   */
  async refresh(refreshToken: string): Promise<AuthResult> {
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is required');
    }

    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: authConfig.jwt.refreshSecret,
      });

      const user = await this.usersService.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('User session is invalid');
      }

      const tokens = await this.generateTokens(user);

      return {
        user,
        ...tokens,
      };
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Generate dual Access & Refresh JWT tokens
   */
  private async generateTokens(user: UserDocument): Promise<TokenPair> {
    const payload = {
      sub: user._id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: authConfig.jwt.accessSecret,
        expiresIn: authConfig.jwt.accessExpiresIn as any,
      }),
      this.jwtService.signAsync(payload, {
        secret: authConfig.jwt.refreshSecret,
        expiresIn: authConfig.jwt.refreshExpiresIn as any,
      }),
    ]);

    return { accessToken, refreshToken };
  }

  /**
   * Set secure HttpOnly cookies on the HTTP response
   */
  setAuthCookies(res: Response, accessToken: string, refreshToken?: string): void {
    res.cookie(
      authConfig.cookies.accessTokenName,
      accessToken,
      authConfig.cookies.options(authConfig.cookies.accessMaxAge)
    );

    if (refreshToken) {
      res.cookie(
        authConfig.cookies.refreshTokenName,
        refreshToken,
        authConfig.cookies.options(authConfig.cookies.refreshMaxAge)
      );
    }
  }

  /**
   * Clear authentication session cookies on logout
   */
  clearAuthCookies(res: Response): void {
    res.clearCookie(authConfig.cookies.accessTokenName, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
    res.clearCookie(authConfig.cookies.refreshTokenName, {
      path: '/',
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    });
  }
}
