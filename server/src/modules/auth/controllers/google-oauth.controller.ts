import { Controller, Get, Inject, Req, Res, UseFilters, UseGuards } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { appConfig, AppConfig } from '../../../config/app.config';
import { AuthService } from '../services/auth.service';
import { AuthCookieService } from '../services/auth-cookie.service';
import { GoogleOAuthService, GoogleProfile } from '../services/google-oauth.service';
import { GoogleOAuthGuard } from '../guards/google-oauth.guard';
import { OAuthCallbackFilter } from '../filters/oauth-callback.filter';

@ApiTags('Auth')
@Public()
@Controller('auth/google')
export class GoogleOAuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly googleOAuth: GoogleOAuthService,
    private readonly cookies: AuthCookieService,
    @Inject(appConfig.KEY) private readonly app: AppConfig,
  ) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  @ApiOperation({ summary: 'Start Google sign-in (browser redirect to Google)' })
  @ApiQuery({ name: 'redirect', required: false, description: 'Relative path to return to after sign-in' })
  @ApiQuery({ name: 'remember', required: false, description: '"true" for a long-lived session' })
  @ApiResponse({ status: 302, description: 'Redirect to Google' })
  @ApiResponse({ status: 404, description: 'Google sign-in is not configured (OAUTH_PROVIDER_DISABLED)' })
  start(): void {
    // GoogleOAuthGuard performs the redirect
  }

  @Get('callback')
  @UseGuards(GoogleOAuthGuard)
  @UseFilters(OAuthCallbackFilter)
  @ApiOperation({ summary: 'Google OAuth callback: signs in, then redirects back to the storefront' })
  @ApiResponse({ status: 302, description: 'Redirect to the storefront (or /login?oauthError=CODE on failure)' })
  async callback(@Req() req: Request, @ReqMeta() meta: RequestMeta, @Res() res: Response): Promise<void> {
    const state = this.cookies.readOAuthState(req);
    this.cookies.clearOAuthState(res);

    const user = await this.googleOAuth.resolveUser(req.user as GoogleProfile, meta);
    const outcome = await this.authService.loginWithOAuth(user, state?.remember ?? false, meta);
    this.cookies.applyLoginOutcome(res, outcome);

    const redirect = state?.redirect ?? '/';
    const target = outcome.mfaRequired ? `/login/verify?redirect=${encodeURIComponent(redirect)}` : redirect;
    res.redirect(`${this.app.clientUrl}${target}`);
  }
}
