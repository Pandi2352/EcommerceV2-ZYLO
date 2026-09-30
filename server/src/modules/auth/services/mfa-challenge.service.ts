import { HttpStatus, Inject, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { deriveSecret } from '../../../common/utils/crypto.util';
import { authConfig, AuthConfig } from '../../../config/auth.config';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthPortal } from '../enums/auth-portal.enum';
import { MFA_CHALLENGE_TTL_MS } from '../auth.constants';

export interface MfaChallengePayload {
  sub: string;
  portal: AuthPortal;
  rememberMe: boolean;
  typ: 'mfa';
}

/**
 * Short-lived token proving the first factor passed. It is signed with a
 * dedicated derived secret so it can never be accepted as an access token.
 */
@Injectable()
export class MfaChallengeService {
  private readonly secret: string;

  constructor(
    private readonly jwtService: JwtService,
    @Inject(authConfig.KEY) config: AuthConfig,
  ) {
    this.secret = deriveSecret(config.accessSecret, 'mfa-challenge');
  }

  create(user: UserDocument, rememberMe: boolean, portal: AuthPortal): Promise<string> {
    const payload: MfaChallengePayload = { sub: user._id, portal, rememberMe, typ: 'mfa' };
    return this.jwtService.signAsync(payload, {
      secret: this.secret,
      expiresIn: Math.floor(MFA_CHALLENGE_TTL_MS / 1000),
    });
  }

  async verify(token: string | undefined): Promise<MfaChallengePayload> {
    try {
      if (!token) throw new Error('missing challenge');
      const payload = await this.jwtService.verifyAsync<MfaChallengePayload>(token, { secret: this.secret });
      if (payload.typ !== 'mfa') throw new Error('wrong token type');
      return payload;
    } catch {
      throw new AppException(
        HttpStatus.UNAUTHORIZED,
        ErrorCode.MFA_CHALLENGE_INVALID,
        'Your sign-in attempt expired. Please sign in again.',
      );
    }
  }
}
