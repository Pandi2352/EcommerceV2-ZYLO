import { Inject, Injectable } from '@nestjs/common';
import { CookieOptions, Request, Response } from 'express';
import { authConfig, AuthConfig } from '../../../config/auth.config';
import { IssuedTokens } from './token.service';
import { LoginOutcome, LoginResponse } from '../interfaces/login-outcome.interface';
import {
  ACCESS_TOKEN_COOKIE,
  MFA_CHALLENGE_COOKIE,
  MFA_CHALLENGE_TTL_MS,
  OAUTH_STATE_COOKIE,
  OAUTH_STATE_TTL_MS,
  REFRESH_TOKEN_COOKIE,
} from '../auth.constants';

export interface OAuthState {
  nonce: string;
  redirect: string;
  remember: boolean;
}

/** Single place that reads and writes every authentication cookie. */
@Injectable()
export class AuthCookieService {
  constructor(@Inject(authConfig.KEY) private readonly config: AuthConfig) {}

  read(req: Request, name: string): string | undefined {
    const value = req.cookies?.[name];
    return typeof value === 'string' ? value : undefined;
  }

  setSession(res: Response, tokens: IssuedTokens): void {
    res.cookie(ACCESS_TOKEN_COOKIE, tokens.accessToken, this.options(this.config.accessTtlMs));
    res.cookie(REFRESH_TOKEN_COOKIE, tokens.refreshToken, this.options(tokens.refreshTtlMs));
  }

  clearSession(res: Response): void {
    res.clearCookie(ACCESS_TOKEN_COOKIE, this.options());
    res.clearCookie(REFRESH_TOKEN_COOKIE, this.options());
  }

  /** Write the cookies for a login step and return the response body. */
  applyLoginOutcome(res: Response, outcome: LoginOutcome): LoginResponse {
    if ('challengeToken' in outcome) {
      res.cookie(MFA_CHALLENGE_COOKIE, outcome.challengeToken, this.options(MFA_CHALLENGE_TTL_MS));
      return { mfaRequired: true };
    }
    this.setSession(res, outcome.tokens);
    res.clearCookie(MFA_CHALLENGE_COOKIE, this.options());
    return { mfaRequired: false, user: outcome.user };
  }

  setOAuthState(res: Response, state: OAuthState): void {
    // Must be 'lax': the provider redirects back cross-site, and 'strict' cookies would be withheld.
    res.cookie(OAUTH_STATE_COOKIE, JSON.stringify(state), {
      ...this.options(OAUTH_STATE_TTL_MS),
      sameSite: 'lax',
    });
  }

  readOAuthState(req: Request): OAuthState | null {
    try {
      const parsed = JSON.parse(this.read(req, OAUTH_STATE_COOKIE) ?? '');
      return typeof parsed?.nonce === 'string' ? (parsed as OAuthState) : null;
    } catch {
      return null;
    }
  }

  clearOAuthState(res: Response): void {
    res.clearCookie(OAUTH_STATE_COOKIE, { ...this.options(), sameSite: 'lax' });
  }

  private options(maxAgeMs?: number): CookieOptions {
    return {
      httpOnly: true,
      secure: this.config.cookieSecure,
      sameSite: this.config.cookieSameSite,
      path: '/',
      ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
    };
  }
}
