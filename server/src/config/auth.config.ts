import { CookieOptions } from 'express';

export const authConfig = {
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'zylo_super_secret_access_jwt_key_2026_dev',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'zylo_super_secret_refresh_jwt_key_2026_dev',
    accessExpiresIn: '15m',
    refreshExpiresIn: '7d',
  },
  cookies: {
    accessTokenName: 'access_token',
    refreshTokenName: 'refresh_token',
    options: (maxAgeMs: number): CookieOptions => ({
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      path: '/',
      maxAge: maxAgeMs,
    }),
    accessMaxAge: 15 * 60 * 1000, // 15 minutes in ms
    refreshMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
};
