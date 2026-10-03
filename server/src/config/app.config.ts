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

function userCodePrefix(): string {
  const prefix = (process.env.USER_CODE_PREFIX || 'ZY').trim().toUpperCase();
  if (!/^[A-Z]{2,5}$/.test(prefix)) {
    throw new Error('USER_CODE_PREFIX must be 2–5 letters (e.g. ZY).');
  }
  return prefix;
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
    corsOrigins: [
      ...new Set([
        ...clientOrigins,
        ...adminOrigins,
        'http://localhost:5175',
        'http://127.0.0.1:5175',
        'http://localhost:5176',
        'http://127.0.0.1:5176',
      ]),
    ],
    /** Shop prefix for generated staff User IDs, e.g. "ZY" → ZY-0001 (2–5 letters) */
    userCodePrefix: userCodePrefix(),
    /** Key for encrypting secrets at rest (e.g. TOTP secrets). Changing it invalidates them. */
    encryptionKey: requireEnv('ENCRYPTION_KEY', 32),
  };
});

export type AppConfig = ReturnType<typeof appConfig>;
