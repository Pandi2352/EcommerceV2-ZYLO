/**
 * Accept only same-site relative paths ("/account"), rejecting absolute and
 * protocol-relative URLs ("https://evil.test", "//evil.test", "/\\evil.test")
 * to prevent open redirects.
 */
export function safeRedirectPath(path: unknown, fallback = '/'): string {
  if (typeof path !== 'string' || path.length > 512) return fallback;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
  return path;
}
