import { fileURLToPath } from 'node:url';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, loadEnv, type UserConfigExport } from 'vite';

/**
 * Vite config shared by apps/storefront and apps/admin.
 *
 * Ports and hosts are NOT hardcoded: they come from the same variables the API
 * uses for CORS and email links, in the repo-root .env:
 *   CLIENT_URL → storefront dev server   (default http://localhost:5176)
 *   ADMIN_URL  → admin dev server        (default http://127.0.0.1:5175)
 *   PORT       → API port for the /api proxy (default 5000), or API_PROXY_TARGET
 * So the browser origin always matches an origin the API allows.
 */

export type AppName = 'storefront' | 'admin';

const REPO_ROOT = fileURLToPath(new URL('../..', import.meta.url));
const SHARED_SRC = fileURLToPath(new URL('./src', import.meta.url));
const SHARED_PUBLIC = fileURLToPath(new URL('./public', import.meta.url));

const APP_URL: Record<AppName, { envKey: string; fallback: string }> = {
  storefront: { envKey: 'CLIENT_URL', fallback: 'http://localhost:5176' },
  admin: { envKey: 'ADMIN_URL', fallback: 'http://127.0.0.1:5175' },
};

/** First origin of a comma-separated list, as the API reads it. */
function appOrigin(env: Record<string, string>, app: AppName): URL {
  const { envKey, fallback } = APP_URL[app];
  const first = (env[envKey] || fallback).split(',')[0].trim().replace(/\/+$/, '');
  return new URL(first || fallback);
}

export function createAppConfig(app: AppName): UserConfigExport {
  return defineConfig(({ mode }) => {
    // Read the repo-root .env here in Node only. Nothing is exposed to the browser
    // except what is explicitly passed through `define` below.
    const env = loadEnv(mode, REPO_ROOT, '');
    const origin = appOrigin(env, app);
    const port = Number(origin.port) || (origin.protocol === 'https:' ? 443 : 80);
    const apiTarget = env.API_PROXY_TARGET || `http://localhost:${env.PORT || 5000}`;
    const storefrontUrl = env.VITE_STOREFRONT_URL || appOrigin(env, 'storefront').origin;

    const server = {
      host: origin.hostname,
      port,
      // Fail instead of silently moving to another port the API would not allow
      strictPort: true,
      proxy: { '/api': { target: apiTarget, changeOrigin: true } },
    };

    return {
      plugins: [react(), tailwindcss()],
      resolve: {
        alias: { '@shared': SHARED_SRC },
        // Shared code must use the same React / router instance as the app
        dedupe: ['react', 'react-dom', 'react-router-dom'],
      },
      // Brand assets (logo, loader, favicon) are shared by both apps
      publicDir: SHARED_PUBLIC,
      define: {
        __STOREFRONT_URL__: JSON.stringify(storefrontUrl),
      },
      server,
      preview: server,
    };
  });
}
