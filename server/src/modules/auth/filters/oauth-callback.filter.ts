import { ArgumentsHost, Catch, ExceptionFilter, Inject, Logger } from '@nestjs/common';
import { Response } from 'express';
import { appConfig, AppConfig } from '../../../config/app.config';
import { AppException } from '../../../common/exceptions/app.exception';
import { ErrorCode } from '../../../common/constants/error-codes';
import { AuthCookieService } from '../services/auth-cookie.service';

/**
 * The OAuth callback is a browser navigation, not an API call: on failure,
 * send the user back to the login page with an error code instead of JSON.
 */
@Catch()
export class OAuthCallbackFilter implements ExceptionFilter {
  private readonly logger = new Logger(OAuthCallbackFilter.name);

  constructor(
    @Inject(appConfig.KEY) private readonly app: AppConfig,
    private readonly cookies: AuthCookieService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    const res = host.switchToHttp().getResponse<Response>();
    const code = exception instanceof AppException ? exception.code : ErrorCode.OAUTH_FAILED;
    if (!(exception instanceof AppException)) {
      this.logger.warn(`OAuth callback failed: ${(exception as Error)?.message ?? exception}`);
    }

    this.cookies.clearOAuthState(res);
    res.redirect(`${this.app.clientUrl}/login?oauthError=${encodeURIComponent(code)}`);
  }
}
