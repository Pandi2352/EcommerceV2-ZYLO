import { registerAs } from '@nestjs/config';
import { requireEnv } from '../common/utils/env.util';

/** Local development defaults. The admin uses 127.0.0.1 so its cookies stay separate from the storefront's. */
const DEFAULT_CLIENT_URL = 'http://localhost:5176';
const DEFAULT_ADMIN_URL = 'http://127.0.0.1:5175';

/** Split a comma-separated origin list and normalise each entry (no whitespace or trailing slash). */
export function parseOrigins(value: string | undefined, fallback: string): string[] {
  const origins = (value || fallback)
    .split(',')
    .map((origin) => origin.trim().replace(/\/+$/, ''))
    .filter(Boolean);
  return origins.length ? origins : [fallback];
}

export const appConfig = registerAs('app', () => {
  const clientOrigins = parseOrigins(process.env.CLIENT_URL, DEFAULT_CLIENT_URL);
  const adminOrigins = parseOrigins(process.env.ADMIN_URL, DEFAULT_ADMIN_URL);

  return {
    name: process.env.APP_NAME || 'ZYLO',
    /** Storefront origin: customer email links and OAuth redirects (first CLIENT_URL entry) */
    clientUrl: clientOrigins[0],
    /** Admin console origin: staff email links (first ADMIN_URL entry) */
    adminUrl: adminOrigins[0],
    /** Every origin allowed to call the API from a browser */
    corsOrigins: [...new Set([...clientOrigins, ...adminOrigins])],
    /** Key for encrypting secrets at rest (e.g. TOTP secrets). Changing it invalidates them. */
    encryptionKey: requireEnv('ENCRYPTION_KEY', 32),
  };
});

export type AppConfig = ReturnType<typeof appConfig>;
