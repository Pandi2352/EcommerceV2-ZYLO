import { Body, Controller, Get, HttpCode, HttpStatus, Inject, Post, Req, Res, UnauthorizedException } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AllowPasswordChangePending } from '../../../common/decorators/allow-password-change-pending.decorator';
import { THROTTLE_CREDENTIALS } from '../../../common/constants/throttle.constants';
import { oauthConfig, OAuthConfig } from '../../../config/oauth.config';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthService } from '../services/auth.service';
import { AuthCookieService } from '../services/auth-cookie.service';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { AuthPortal } from '../enums/auth-portal.enum';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';

import { PermissionResolverService } from '../../../common/authorization/permission-resolver.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
    private readonly permissionResolver: PermissionResolverService,
    @Inject(oauthConfig.KEY) private readonly oauth: OAuthConfig,
  ) {}

  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a customer account and send an email verification link' })
  @ApiResponse({ status: 201, description: 'Account created; session cookies set' })
  @ApiResponse({ status: 409, description: 'Email address already registered (code EMAIL_TAKEN)' })
  async register(@Body() dto: RegisterDto, @ReqMeta() meta: RequestMeta, @Res({ passthrough: true }) res: Response) {
    return this.cookies.applyLoginOutcome(res, await this.authService.register(dto, meta));
  }

  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Customer storefront sign-in (staff accounts are rejected)' })
  @ApiResponse({ status: 200, description: '{ mfaRequired: false, user } with session cookies, or { mfaRequired: true }' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 403, description: 'Staff account (code WRONG_PORTAL) or deactivated account' })
  @ApiResponse({ status: 423, description: 'Temporarily locked after repeated failures (code ACCOUNT_LOCKED)' })
  async login(@Body() dto: LoginDto, @ReqMeta() meta: RequestMeta, @Res({ passthrough: true }) res: Response) {
    return this.cookies.applyLoginOutcome(res, await this.authService.login(dto, AuthPortal.CUSTOMER, meta));
  }

  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Admin portal sign-in (staff roles only)' })
  @ApiResponse({ status: 200, description: '{ mfaRequired: false, user } with session cookies, or { mfaRequired: true }' })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 403, description: 'Not a staff account (code WRONG_PORTAL)' })
  @ApiResponse({ status: 423, description: 'Temporarily locked after repeated failures (code ACCOUNT_LOCKED)' })
  async adminLogin(@Body() dto: LoginDto, @ReqMeta() meta: RequestMeta, @Res({ passthrough: true }) res: Response) {
    return this.cookies.applyLoginOutcome(res, await this.authService.login(dto, AuthPortal.ADMIN, meta));
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth('refresh_token')
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiResponse({ status: 200, description: 'Session refreshed; new cookies set' })
  @ApiResponse({ status: 401, description: 'Invalid, expired, revoked or reused refresh token' })
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = this.cookies.read(req, REFRESH_TOKEN_COOKIE);
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie not found');
    }

    try {
      const { user, tokens } = await this.authService.refresh(refreshToken);
      this.cookies.setSession(res, tokens);
      return { user };
    } catch (error) {
      this.cookies.clearSession(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out' })
  async logout(@Req() req: Request, @ReqMeta() meta: RequestMeta, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(this.cookies.read(req, REFRESH_TOKEN_COOKIE), meta);
    this.cookies.clearSession(res);
    return { message: 'Logged out successfully' };
  }

  @AllowPasswordChangePending()
  @Post('logout-all')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Sign out of every device by revoking all sessions' })
  @ApiResponse({ status: 200, description: 'All sessions revoked' })
  async logoutAll(@CurrentUser() user: UserDocument, @ReqMeta() meta: RequestMeta, @Res({ passthrough: true }) res: Response) {
    await this.authService.logoutAll(user, meta);
    this.cookies.clearSession(res);
    return { message: 'Signed out of all devices' };
  }

  @AllowPasswordChangePending()
  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Retrieve the currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile' })
  @ApiResponse({ status: 401, description: 'Not signed in' })
  async getProfile(@CurrentUser() user: UserDocument) {
    const isStaff = user.accountType === 'STAFF' || (user.role && user.role !== 'CUSTOMER');
    if (!isStaff) {
      return { user };
    }

    const { permissions, roles } = await this.permissionResolver.forUser(user.roleIds || []);
    const userJson: Record<string, any> = user.toJSON ? user.toJSON() : { ...user };
    userJson.permissions = permissions;
    userJson.roles = roles;

    return { user: userJson };
  }

  @Public()
  @Get('providers')
  @ApiOperation({ summary: 'Which social sign-in providers are enabled' })
  @ApiResponse({ status: 200, description: '{ google: boolean }' })
  getProviders() {
    return { google: this.oauth.google.enabled };
  }
}
