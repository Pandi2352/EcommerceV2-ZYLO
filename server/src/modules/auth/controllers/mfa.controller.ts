import { Body, Controller, HttpCode, HttpStatus, Post, Req, Res } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { THROTTLE_CREDENTIALS } from '../../../common/constants/throttle.constants';
import { UserDocument } from '../../users/schemas/user.schema';
import { AuthService } from '../services/auth.service';
import { AuthCookieService } from '../services/auth-cookie.service';
import { MfaService } from '../services/mfa.service';
import { MfaCodeDto } from '../dto/mfa-code.dto';
import { DisableMfaDto } from '../dto/disable-mfa.dto';
import { MFA_CHALLENGE_COOKIE } from '../auth.constants';

@ApiTags('Auth')
@Controller('auth/mfa')
export class MfaController {
  constructor(
    private readonly mfaService: MfaService,
    private readonly authService: AuthService,
    private readonly cookies: AuthCookieService,
  ) {}

  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Complete sign-in with an authenticator or backup code (uses the mfa_challenge cookie)' })
  @ApiResponse({ status: 200, description: '{ mfaRequired: false, user } with session cookies' })
  @ApiResponse({ status: 401, description: 'Invalid code (MFA_INVALID_CODE) or expired challenge (MFA_CHALLENGE_INVALID)' })
  async verify(@Body() dto: MfaCodeDto, @ReqMeta() meta: RequestMeta, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const outcome = await this.authService.completeMfa(this.cookies.read(req, MFA_CHALLENGE_COOKIE), dto.code, meta);
    return this.cookies.applyLoginOutcome(res, outcome);
  }

  @Post('setup')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Start two-factor setup: returns a secret and QR code to scan' })
  @ApiResponse({ status: 200, description: '{ secret, otpauthUrl, qrCodeDataUrl }' })
  setup(@CurrentUser() user: UserDocument) {
    return this.mfaService.beginSetup(user);
  }

  @Throttle(THROTTLE_CREDENTIALS)
  @Post('enable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Confirm setup with a code from the authenticator app; returns one-time backup codes' })
  @ApiResponse({ status: 200, description: '{ backupCodes: string[] } (shown once)' })
  enable(@CurrentUser() user: UserDocument, @Body() dto: MfaCodeDto, @ReqMeta() meta: RequestMeta) {
    return this.mfaService.enable(user, dto.code, meta);
  }

  @Throttle(THROTTLE_CREDENTIALS)
  @Post('disable')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Turn off two-factor authentication (requires password and a code)' })
  @ApiResponse({ status: 200, description: 'Two-factor authentication disabled' })
  async disable(@CurrentUser() user: UserDocument, @Body() dto: DisableMfaDto, @ReqMeta() meta: RequestMeta) {
    await this.mfaService.disable(user, dto, meta);
    return { message: 'Two-factor authentication has been disabled.' };
  }

  @Throttle(THROTTLE_CREDENTIALS)
  @Post('backup-codes')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Replace all backup codes (requires an authenticator code)' })
  @ApiResponse({ status: 200, description: '{ backupCodes: string[] } (shown once)' })
  regenerateBackupCodes(@CurrentUser() user: UserDocument, @Body() dto: MfaCodeDto, @ReqMeta() meta: RequestMeta) {
    return this.mfaService.regenerateBackupCodes(user, dto.code, meta);
  }
}
