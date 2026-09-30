import { CookieOptions } from 'express';

export const authConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'zylo_super_secret_access_jwt_key_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'zylo_super_secret_refresh_jwt_key_2026_dev',
    accessExpiresIn: '15m',
    refreshExpiresInStandard: '1d', // 1 day for standard session
    refreshExpiresInRemember: '30d', // 30 days when "Remember Me" is enabled
  },
  cookies: {
    accessTokenName: 'access_token',
    refreshTokenName: 'refresh_token',
    options: (maxAgeMs?: number): CookieOptions => ({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      ...(maxAgeMs !== undefined ? { maxAge: maxAgeMs } : {}),
    }),
    accessMaxAge: 15 * 60 * 1000, // 15 minutes in ms
    refreshMaxAgeStandard: 24 * 60 * 60 * 1000, // 1 day in ms
    refreshMaxAgeRemember: 30 * 24 * 60 * 60 * 1000, // 30 days in ms
  },
};
