import { registerAs } from '@nestjs/config';
import { optionalEnv } from '../common/utils/env.util';

/** OAuth providers are enabled only when their credentials are configured. */
export const oauthConfig = registerAs('oauth', () => {
  const clientId = optionalEnv('GOOGLE_CLIENT_ID');
  const clientSecret = optionalEnv('GOOGLE_CLIENT_SECRET');
  return {
    google: {
      enabled: Boolean(clientId && clientSecret),
      clientId: clientId ?? '',
      clientSecret: clientSecret ?? '',
      callbackUrl: optionalEnv('GOOGLE_CALLBACK_URL') ?? 'http://localhost:5173/api/v1/auth/google/callback',
    },
  };
});

export type OAuthConfig = ReturnType<typeof oauthConfig>;
