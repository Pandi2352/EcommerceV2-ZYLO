import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBearerAuth, ApiCookieAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../../../common/decorators/public.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ReqMeta, RequestMeta } from '../../../common/decorators/request-meta.decorator';
import { THROTTLE_CREDENTIALS, THROTTLE_EMAIL } from '../../../common/constants/throttle.constants';
import { UserDocument } from '../../users/schemas/user.schema';
import { EmailVerificationService } from '../services/email-verification.service';
import { TokenDto } from '../dto/token.dto';

@ApiTags('Auth')
@Controller('auth/email')
export class EmailVerificationController {
  constructor(private readonly emailVerification: EmailVerificationService) {}

  /**
   * POST (not GET) so link scanners and prefetchers that open emailed URLs
   * cannot consume the token; the client page submits it.
   */
  @Public()
  @Throttle(THROTTLE_CREDENTIALS)
  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Confirm an email address with the token from the verification link' })
  @ApiResponse({ status: 200, description: 'Email verified' })
  @ApiResponse({ status: 400, description: 'Invalid or expired token (code INVALID_TOKEN)' })
  async verify(@Body() dto: TokenDto, @ReqMeta() meta: RequestMeta) {
    await this.emailVerification.verify(dto.token, meta);
    return { message: 'Your email address has been verified.' };
  }

  @Throttle(THROTTLE_EMAIL)
  @Post('resend-verification')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Send a new verification link to the signed-in user' })
  @ApiResponse({ status: 200, description: 'Verification email sent' })
  @ApiResponse({ status: 400, description: 'Already verified (code EMAIL_ALREADY_VERIFIED)' })
  async resend(@CurrentUser() user: UserDocument) {
    await this.emailVerification.resend(user);
    return { message: 'A new verification link has been sent to your email.' };
  }
}
