import { ExecutionContext, HttpStatus, Inject, Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response } from 'express';
import { oauthConfig, OAuthConfig } from '../../../config/oauth.config';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { generateToken, safeEqual } from '../../../common/utils/crypto.util';
import { AuthCookieService } from '../services/auth-cookie.service';
import { safeRedirectPath } from '../utils/safe-redirect.util';

/**
 * Drives the Google OAuth round-trip. On the way out it stores a CSRF nonce
 * (plus the post-login redirect) in a cookie; on the way back it rejects any
 * callback whose `state` does not match that cookie before exchanging the code.
 */
@Injectable()
export class GoogleOAuthGuard extends AuthGuard('google') {
  constructor(
    @Inject(oauthConfig.KEY) private readonly config: OAuthConfig,
    private readonly cookies: AuthCookieService,
  ) {
    super();
  }

  canActivate(context: ExecutionContext) {
    if (!this.config.google.enabled) {
      throw new AppException(HttpStatus.NOT_FOUND, ErrorCode.OAUTH_PROVIDER_DISABLED, 'Google sign-in is not configured.');
    }

    const req = context.switchToHttp().getRequest<Request>();
    if (this.isCallback(req)) {
      const state = this.cookies.readOAuthState(req);
      if (!state || typeof req.query.state !== 'string' || !safeEqual(state.nonce, req.query.state)) {
        throw new AppException(HttpStatus.UNAUTHORIZED, ErrorCode.OAUTH_FAILED, 'Google sign-in could not be verified. Please try again.');
      }
    }
    return super.canActivate(context);
  }

  getAuthenticateOptions(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest<Request>();
    if (this.isCallback(req)) {
      return { session: false };
    }

    const nonce = generateToken(16);
    this.cookies.setOAuthState(context.switchToHttp().getResponse<Response>(), {
      nonce,
      redirect: safeRedirectPath(req.query.redirect),
      remember: req.query.remember === 'true',
    });
    return { session: false, state: nonce, prompt: 'select_account' };
  }

  private isCallback(req: Request): boolean {
    return 'code' in req.query || 'error' in req.query || 'state' in req.query;
  }
}
