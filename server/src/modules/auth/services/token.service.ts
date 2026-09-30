import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import { Model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';
import { authConfig, AuthConfig } from '../../../config/auth.config';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuditService } from '../../audit/audit.service';
import { AuditEvent } from '../../audit/audit-event.enum';
import { RefreshSession, RefreshSessionDocument } from '../schemas/refresh-session.schema';
import { REFRESH_REUSE_GRACE_MS } from '../auth.constants';

export interface AccessTokenPayload {
  sub: string;
  email: string;
  role: string;
  iat?: number;
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
 * rotation on every refresh, reuse detection, and revocation.
 */
@Injectable()
export class TokenService {
  constructor(
    @InjectModel(RefreshSession.name)
    private readonly sessionModel: Model<RefreshSessionDocument>,
    private readonly jwtService: JwtService,
    private readonly auditService: AuditService,
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
        { returnDocument: 'before' },
      )
      .exec();

    if (session) {
      return session;
    }

    const existing = await this.sessionModel.findById(payload.jti).exec();
    if (existing?.revokedAt && Date.now() - existing.revokedAt.getTime() > REFRESH_REUSE_GRACE_MS) {
      await this.revokeWhere({ familyId: existing.familyId });
      await this.auditService.log({
        event: AuditEvent.REFRESH_TOKEN_REUSE,
        subject: { _id: existing.userId },
        metadata: { familyId: existing.familyId },
      });
    }
    throw new UnauthorizedException('Invalid or expired refresh token');
  }

  /** Session settings behind a refresh token, without consuming it. */
  async peek(refreshToken: string | undefined): Promise<RefreshSessionDocument | null> {
    if (!refreshToken) return null;
    try {
      const payload = await this.verifyRefresh(refreshToken, false);
      return await this.sessionModel.findOne({ _id: payload.jti, revokedAt: null }).exec();
    } catch {
      return null;
    }
  }

  /** Revoke the session behind a refresh token (logout). Returns the owning user id, if any. */
  async revoke(refreshToken: string): Promise<string | null> {
    try {
      const payload = await this.verifyRefresh(refreshToken, true);
      await this.revokeWhere({ _id: payload.jti });
      return payload.sub;
    } catch {
      // Logout must always succeed; an unusable token has nothing left to revoke.
      return null;
    }
  }

  /** Sign the user out everywhere (logout-all, password change or reset). */
  async revokeAllForUser(userId: string): Promise<void> {
    await this.revokeWhere({ userId });
  }

  private async revokeWhere(filter: Record<string, string>): Promise<void> {
    await this.sessionModel
      .updateMany({ ...filter, revokedAt: null }, { $set: { revokedAt: new Date() } })
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
