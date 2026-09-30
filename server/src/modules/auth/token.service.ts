import { Inject, Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { authConfig, AuthConfig } from '../../config/auth.config';
import { UserDocument } from '../users/schemas/user.schema';
import { RefreshSession, RefreshSessionDocument } from './schemas/refresh-session.schema';
import { REFRESH_REUSE_GRACE_MS } from './auth.constants';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
}

interface RefreshTokenPayload {
  sub: string;
  jti: string;
  fam: string;
}

export interface IssuedTokens {
  accessToken: string;
  refreshToken: string;
  refreshTtlMs: number;
  rememberMe: boolean;
}

/**
 * Issues access/refresh token pairs and manages the refresh-session lifecycle:
 * rotation on every refresh, reuse detection, and revocation on logout.
 */
@Injectable()
export class TokenService {
  private readonly logger = new Logger(TokenService.name);

  constructor(
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSessionDocument>,
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY) private readonly config: AuthConfig,
  ) {}

  async issue(user: UserDocument, rememberMe: boolean, familyId: string = uuidv4()): Promise<IssuedTokens> {
    const refreshTtlMs = rememberMe ? this.config.refreshRememberTtlMs : this.config.refreshTtlMs;
    const session = await this.sessionModel.create({
      userId: user._id,
      familyId,
      rememberMe,
      expiresAt: new Date(Date.now() + refreshTtlMs),
    });

    const accessPayload: AccessTokenPayload = { sub: user._id, email: user.email, role: user.role };
    const refreshPayload: RefreshTokenPayload = { sub: user._id, jti: session._id, fam: familyId };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(accessPayload, {
        secret: this.config.accessSecret,
        expiresIn: Math.floor(this.config.accessTtlMs / 1000),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.config.refreshSecret,
        expiresIn: Math.floor(refreshTtlMs / 1000),
      }),
    ]);

    return { accessToken, refreshToken, refreshTtlMs, rememberMe };
  }

  /**
   * Consume a refresh token and return its session so a new pair can be issued.
   * A token that was already rotated signals theft: the whole family is revoked.
   */
  async consume(refreshToken: string): Promise<RefreshSessionDocument> {
    const payload = await this.verifyRefresh(refreshToken, false);

    const session = await this.sessionModel
      .findOneAndUpdate(
        { _id: payload.jti, revokedAt: null },
        { $set: { revokedAt: new Date() } },
        { new: false },
      )
      .exec();

    if (session) {
      return session;
    }

    const existing = await this.sessionModel.findById(payload.jti).exec();
    if (existing?.revokedAt && Date.now() - existing.revokedAt.getTime() > REFRESH_REUSE_GRACE_MS) {
      await this.revokeFamily(existing.familyId);
      this.logger.warn(`Refresh token reuse detected for user ${existing.userId}; session family revoked`);
    }
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  /** Revoke the session behind a refresh token (logout). Invalid tokens are ignored. */
  async revoke(refreshToken: string): Promise<void> {
    try {
      const payload = await this.verifyRefresh(refreshToken, true);
      await this.sessionModel
        .updateOne({ _id: payload.jti, revokedAt: null }, { $set: { revokedAt: new Date() } })
        .exec();
    } catch {
      // Logout must always succeed; an unusable token has nothing left to revoke.
    }
  }

  private async revokeFamily(familyId: string): Promise<void> {
    await this.sessionModel
      .updateMany({ familyId, revokedAt: null }, { $set: { revokedAt: new Date() } })
      .exec();
  }

  private async verifyRefresh(token: string, ignoreExpiration: boolean): Promise<RefreshTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<RefreshTokenPayload>(token, {
        secret: this.config.refreshSecret,
        ignoreExpiration,
      });
      if (!payload.jti || !payload.fam) {
        throw new Error('Refresh token is missing session claims');
      }
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }
}
