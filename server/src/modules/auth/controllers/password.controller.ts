import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { AllowPasswordChangePending } from '../../../common/decorators/allow-password-change-pending.decorator';
import { THROTTLE_CREDENTIALS, THROTTLE_EMAIL } from '../../../common/constants/throttle.constants';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthService } from '../services/auth.service';
import { AuthCookieService } from '../services/auth-cookie.service';
import { PasswordManagementService } from '../services/password-management.service';
import { ForgotPasswordDto } from '../dto/forgot-password.dto';
import { ResetPasswordDto } from '../dto/reset-password.dto';
import { ChangePasswordDto } from '../dto/change-password.dto';
import { REFRESH_TOKEN_COOKIE } from '../auth.constants';

@ApiTags('Auth')
@Controller('auth/password')
export class PasswordController {
  constructor(
    private readonly passwords: PasswordManagementService,
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Public()
  @Throttle(THROTTLE_EMAIL)
  @Post('forgot')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Email a password reset link (valid for 1 hour)' })
  @ApiResponse({ status: 200, description: 'Always succeeds, whether or not the email is registered' })
  async forgot(@Body() dto: ForgotPasswordDto, @ReqMeta() meta: RequestMeta) {
    await this.passwords.requestReset(dto.email, meta);
    return { message: 'If an account exists for that email, a reset link is on its way.' };
  }

  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('reset')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Set a new password using the emailed reset token; signs out all sessions' })
  @ApiResponse({ status: 200, description: 'Password reset' })
  @ApiResponse({ status: 400, description: 'Invalid/expired token (INVALID_TOKEN) or reused password (PASSWORD_REUSED)' })
  async reset(@Body() dto: ResetPasswordDto, @ReqMeta() meta: RequestMeta) {
    await this.passwords.resetPassword(dto, meta);
    return { message: 'Your password has been reset. You can now sign in.' };
  }

  @AllowPasswordChangePending()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('change')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Change password; other devices are signed out, this one gets a new session' })
  @ApiResponse({ status: 200, description: 'Password changed; new session cookies set' })
  @ApiResponse({ status: 400, description: 'Wrong current password, reused password, or no password set' })
  async change(
    @CurrentUser() user: UserDocument,
    @Body() dto: ChangePasswordDto,
    @ReqMeta() meta: RequestMeta,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const rememberMe = await this.authService.isSessionRemembered(this.cookies.read(req, REFRESH_TOKEN_COOKIE));
    const updated = await this.passwords.changePassword(user._id, dto, meta);
    this.cookies.setSession(res, await this.authService.issueSession(updated, rememberMe));
    return { user: updated };
  }
}
