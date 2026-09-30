import { Logger } from '@nestjs/common';
import { CorsOptions } from '@nestjs/common/interfaces/external/cors-options.interface';

/**
 * CORS policy for the API. Browsers may only make credentialed (cookie) requests
 * from the storefront and admin origins in CLIENT_URL / ADMIN_URL.
 *
 * Requests without an Origin header (same-origin navigation, curl, server-to-server,
 * health checks) are not cross-origin and are allowed through.
 */
export function buildCorsOptions(allowedOrigins: string[]): CorsOptions {
  const logger = new Logger('CORS');
  const allowed = new Set(allowedOrigins);

  return {
    origin: (origin, callback) => {
      if (!origin || allowed.has(origin)) {
        callback(null, true);
        return;
      }
      logger.warn(`Blocked cross-origin request from ${origin}`);
      // `false` omits the CORS headers, so the browser rejects the response
      callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    // Let browsers cache preflight results for 10 minutes
    maxAge: 600,
  };
}
