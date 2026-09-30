/** Rate-limit presets for use with @Throttle(). TTLs are in milliseconds. */

/** Credential checks (login, MFA, password reset): 5 attempts per minute per IP. */
export const THROTTLE_CREDENTIALS = { default: { limit: 5, ttl: 60_000 } };

/** Endpoints that send email: 3 requests per minute per IP. */
export const THROTTLE_EMAIL = { default: { limit: 3, ttl: 60_000 } };
