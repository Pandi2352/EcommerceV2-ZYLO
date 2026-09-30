/**
 * Accept only same-site relative paths, rejecting absolute and protocol-relative
 * URLs to prevent open redirects (mirrors the server's safeRedirectPath).
 */
export function safeRedirectPath(path: unknown, fallback = '/'): string {
  if (typeof path !== 'string' || path.length > 512) return fallback;
  if (!path.startsWith('/') || path.startsWith('//') || path.includes('\\')) return fallback;
  return path;
}

/** Where to go after sign-in: router state from ProtectedRoute, then ?redirect=, then fallback. */
export function resolvePostLoginRedirect(
  locationState: unknown,
  searchParams: URLSearchParams,
  fallback: string,
): string {
  const from = (locationState as { from?: { pathname?: string; search?: string } } | null)?.from;
  if (from?.pathname) return safeRedirectPath(`${from.pathname}${from.search ?? ''}`, fallback);
  return safeRedirectPath(searchParams.get('redirect'), fallback);
}
