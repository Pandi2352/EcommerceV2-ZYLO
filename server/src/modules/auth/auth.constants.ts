export const ACCESS_TOKEN_COOKIE = 'access_token';
export const REFRESH_TOKEN_COOKIE = 'refresh_token';

/**
 * A refresh token reused within this window after rotation is treated as a
 * benign race (e.g. two tabs refreshing at once) instead of token theft.
 */
export const REFRESH_REUSE_GRACE_MS = 10 * 1000;
