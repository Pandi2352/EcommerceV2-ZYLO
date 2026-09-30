const MINUTE_MS = 60 * 1000;
const HOUR_MS = 60 * MINUTE_MS;

// ─── Cookies ───────────────────────────────────────────────────────────────────
export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';
/** Holds the short-lived MFA challenge between password check and code entry */
export const MFA_CHALLENGE_COOKIE = 'mfa_challenge';
/** Holds the OAuth CSRF nonce and post-login redirect during the provider round-trip */
export const OAUTH_STATE_COOKIE = 'oauth_state';

// ─── Lifetimes ─────────────────────────────────────────────────────────────────
export const MFA_CHALLENGE_TTL_MS = 5 * MINUTE_MS;
export const OAUTH_STATE_TTL_MS = 10 * MINUTE_MS;
export const PASSWORD_RESET_TTL_MS = HOUR_MS;
export const EMAIL_VERIFICATION_TTL_MS = 24 * HOUR_MS;

/**
 * A refresh token reused within this window after rotation is treated as a
 * benign race (e.g. two tabs refreshing at once) instead of token theft.
 */
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;

// ─── Brute-force lockout ───────────────────────────────────────────────────────
export const MAX_FAILED_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_DURATION_MS = 15 * MINUTE_MS;

// ─── MFA ───────────────────────────────────────────────────────────────────────
export const MFA_BACKUP_CODE_COUNT = 10;
