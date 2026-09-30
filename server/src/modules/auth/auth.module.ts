import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { oauthConfig, OAuthConfig } from '../../config/oauth.config';
import { UsersModule } from '../users/users.module';
import { RefreshSession, RefreshSessionSchema } from './schemas/refresh-session.schema';
// Controllers
import { AuthController } from './controllers/auth.controller';
import { PasswordController } from './controllers/password.controller';
import { EmailVerificationController } from './controllers/email-verification.controller';
import { MfaController } from './controllers/mfa.controller';
import { GoogleOAuthController } from './controllers/google-oauth.controller';
// Services
import { AuthService } from './services/auth.service';
import { TokenService } from './services/token.service';
import { AuthCookieService } from './services/auth-cookie.service';
import { PasswordService } from './services/password.service';
import { PasswordManagementService } from './services/password-management.service';
import { LoginAttemptService } from './services/login-attempt.service';
import { EmailVerificationService } from './services/email-verification.service';
import { MfaService } from './services/mfa.service';
import { MfaChallengeService } from './services/mfa-challenge.service';
import { GoogleOAuthService } from './services/google-oauth.service';
// Passport strategies
import { JwtStrategy } from './strategies/jwt.strategy';
import { GoogleStrategy } from './strategies/google.strategy';

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: RefreshSession.name, schema: RefreshSessionSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // Secrets and lifetimes are passed per call (access, refresh and MFA tokens use different secrets)
    JwtModule.register({}),
  ],
  controllers: [
    AuthController,
    PasswordController,
    EmailVerificationController,
    MfaController,
    GoogleOAuthController,
  ],
  providers: [
    AuthService,
    TokenService,
    AuthCookieService,
    PasswordService,
    PasswordManagementService,
    LoginAttemptService,
    EmailVerificationService,
    MfaService,
    MfaChallengeService,
    GoogleOAuthService,
    JwtStrategy,
    {
      // Passport strategies register themselves on construction, so only build
      // the Google strategy when credentials exist.
      provide: GoogleStrategy,
      inject: [oauthConfig.KEY],
      useFactory: (config: OAuthConfig) => (config.google.enabled ? new GoogleStrategy(config) : null),
    },
  ],
  exports: [AuthService, PassportModule, PasswordService],
})
export class AuthModule {}
