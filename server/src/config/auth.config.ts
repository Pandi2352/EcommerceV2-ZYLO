import { registerAs } from '@nestjs/config';
import { parseDurationMs } from '../common/utils/duration.util';
import { requireEnv } from '../common/utils/env.util';

/**
 * Authentication settings loaded from environment variables.
 * JWT secrets have no fallback: the server refuses to boot without them.
 */
export const authConfig = registerAs('auth', () => {
  const accessSecret = requireEnv('JWT_ACCESS_SECRET', 32);
  const refreshSecret = requireEnv('JWT_REFRESH_SECRET', 32);
  if (accessSecret === refreshSecret) {
    throw new Error('JWT_ACCESS_SECRET and JWT_REFRESH_SECRET must be different values.');
  }

  const isProduction = process.env.NODE_ENV === 'production';

  return {
    accessSecret,
    refreshSecret,
    accessTtlMs: parseDurationMs(process.env.JWT_ACCESS_EXPIRY || '15m'),
    refreshTtlMs: parseDurationMs(process.env.JWT_REFRESH_EXPIRY || '7d'),
    refreshRememberTtlMs: parseDurationMs(process.env.JWT_REFRESH_REMEMBER_EXPIRY || '30d'),
    cookieSecure: isProduction,
    cookieSameSite: (isProduction ? 'strict' : 'lax') as 'strict' | 'lax',
  };
});

export type AuthConfig = ReturnType<typeof authConfig>;
