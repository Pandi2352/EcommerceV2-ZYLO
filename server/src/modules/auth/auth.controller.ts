import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  Res,
  HttpCode,
  HttpStatus,
  UnauthorizedException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { Public } from '../../common/decorators/public.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserDocument } from '../users/schemas/user.schema';
import { REFRESH_TOKEN_COOKIE } from './auth.constants';

// Brute-force protection: 5 attempts per minute per IP on credential endpoints
const CREDENTIAL_THROTTLE = { default: { limit: 5, ttl: 60_000 } };

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Throttle(CREDENTIAL_THROTTLE)
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new customer account' })
  @ApiResponse({
    status: 201,
    description: 'Account created successfully; session cookies dispatched',
  })
  @ApiResponse({ status: 400, description: 'Validation error in request body' })
  @ApiResponse({ status: 409, description: 'Email address already registered' })
  @ApiResponse({ status: 429, description: 'Too many attempts; try again later' })
  async register(
    @Body() dto: RegisterDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, tokens } = await this.authService.register(dto);
    this.authService.setAuthCookies(res, tokens);
    return { user };
  }

  @Public()
  @Throttle(CREDENTIAL_THROTTLE)
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user credentials' })
  @ApiResponse({
    status: 200,
    description: 'Logged in successfully; session cookies dispatched',
  })
  @ApiResponse({ status: 401, description: 'Invalid email or password' })
  @ApiResponse({ status: 429, description: 'Too many attempts; try again later' })
  async login(
    @Body() dto: LoginDto,
    @Res({ passthrough: true }) res: Response
  ) {
    const { user, tokens } = await this.authService.login(dto);
    this.authService.setAuthCookies(res, tokens);
    return { user };
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Rotate the refresh token and issue a new access token' })
  @ApiCookieAuth('refresh_token')
  @ApiResponse({ status: 200, description: 'Session refreshed; new cookies dispatched' })
  @ApiResponse({ status: 401, description: 'Invalid, expired, revoked or reused refresh token' })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const refreshToken: string | undefined = req.cookies?.[REFRESH_TOKEN_COOKIE];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token cookie not found');
    }

    try {
      const { user, tokens } = await this.authService.refresh(refreshToken);
      this.authService.setAuthCookies(res, tokens);
      return { user };
    } catch (error) {
      this.authService.clearAuthCookies(res);
      throw error;
    }
  }

  @Public()
  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Revoke the current session and clear auth cookies' })
  @ApiResponse({ status: 200, description: 'Logged out successfully' })
  async logout(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    await this.authService.logout(req.cookies?.[REFRESH_TOKEN_COOKIE]);
    this.authService.clearAuthCookies(res);
    return {
      message: 'Logged out successfully',
    };
  }

  @Get('me')
  @ApiBearerAuth('JWT-auth')
  @ApiCookieAuth('access_token')
  @ApiOperation({ summary: 'Retrieve currently authenticated user profile' })
  @ApiResponse({ status: 200, description: 'User profile retrieved successfully' })
  @ApiResponse({ status: 401, description: 'Unauthenticated user session' })
  getProfile(@CurrentUser() user: UserDocument) {
    return {
      user,
    };
  }
}
