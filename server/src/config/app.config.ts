import { registerAs } from '@nestjs/config';
import { requireEnv } from '../common/utils/env.util';

export const appConfig = registerAs('app', () => ({
  name: process.env.APP_NAME || 'ZYLO',
  /** Public storefront origin, used to build links in emails and OAuth redirects */
  clientUrl: (process.env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim().replace(/\/$/, ''),
  /** Key for encrypting secrets at rest (e.g. TOTP secrets). Changing it invalidates them. */
  encryptionKey: requireEnv('ENCRYPTION_KEY', 32),
}));

export type AppConfig = ReturnType<typeof appConfig>;
