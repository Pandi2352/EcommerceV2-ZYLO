import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { OAuthConfig } from '../../../config/oauth.config';
import { GoogleProfile } from '../services/google-oauth.service';

/**
 * Registered only when Google credentials are configured (see AuthModule).
 * Performs the OAuth code exchange and normalises the profile.
 */
@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
  constructor(config: OAuthConfig) {
    super({
      clientID: config.google.clientId,
      clientSecret: config.google.clientSecret,
      callbackURL: config.google.callbackUrl,
      scope: ['email', 'profile'],
    });
  }

  validate(_accessToken: string, _refreshToken: string, profile: Profile): GoogleProfile {
    const email = profile.emails?.[0]?.value?.toLowerCase() ?? profile._json.email?.toLowerCase();
    return {
      googleId: profile.id,
      email,
      emailVerified: profile._json.email_verified === true || profile.emails?.[0]?.verified === true,
      name: profile.displayName || email || 'Google user',
      avatarUrl: profile.photos?.[0]?.value,
    };
  }
}
