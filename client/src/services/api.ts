import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';
import type { ApiEnvelope, ApiErrorBody } from '../types/api';

export const API_BASE_URL = '/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

/** Unwrap the server's `{ success, data }` envelope. */
export async function unwrap<T>(request: Promise<AxiosResponse<ApiEnvelope<T>>>): Promise<T> {
  const response = await request;
  return response.data.data;
}

// ─── Session expiry notifications ─────────────────────────────────────────────
type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

/** Subscribe to "the refresh token is no longer valid". Returns an unsubscribe function. */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener);
  return () => sessionExpiredListeners.delete(listener);
}

// ─── Transparent access-token refresh ─────────────────────────────────────────
// Endpoints where a 401 means "wrong input", not "access token expired"
const NO_REFRESH_PATHS = [
  '/auth/login',
  '/auth/admin/login',
  '/auth/register',
  '/auth/refresh',
  '/auth/logout',
  '/auth/mfa/verify',
  '/auth/password/forgot',
  '/auth/password/reset',
  '/auth/email/verify',
];

type RetriableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

let refreshPromise: Promise<void> | null = null;

function refreshSession(): Promise<void> {
  // Concurrent 401s share one refresh call (the server rotates the token on each call)
  refreshPromise ??= axios
    .post(`${API_BASE_URL}/auth/refresh`, {}, { withCredentials: true })
    .then(() => undefined)
    .finally(() => {
      refreshPromise = null;
    });
  return refreshPromise;
}

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetriableRequest | undefined;
    const skip = !original || original._retry || NO_REFRESH_PATHS.some((path) => original.url?.includes(path));

    if (error.response?.status !== 401 || skip) {
      return Promise.reject(error);
    }

    original._retry = true;
    try {
      await refreshSession();
      return api(original);
    } catch (refreshError) {
      sessionExpiredListeners.forEach((listener) => listener());
      return Promise.reject(refreshError);
    }
  },
);

// ─── Error helpers ────────────────────────────────────────────────────────────
export interface ApiError {
  message: string;
  code?: string;
  status?: number;
  retryAfterSeconds?: number;
}

export function getApiError(error: unknown): ApiError {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiErrorBody>;
    const body = axiosError.response?.data;
    const status = axiosError.response?.status;

    if (body?.message) {
      return {
        message: Array.isArray(body.message) ? body.message.join('. ') : body.message,
        code: body.code,
        status,
        retryAfterSeconds: body.retryAfterSeconds,
      };
    }
    if (status === 429) {
      return { message: 'Too many attempts. Please wait a minute and try again.', status };
    }
    if (!axiosError.response) {
      return { message: 'Unable to reach the server. Check your connection and try again.' };
    }
    return { message: axiosError.message, status };
  }
  if (error instanceof Error) {
    return { message: error.message };
  }
  return { message: 'An unexpected error occurred. Please try again.' };
}

export function extractErrorMessage(error: unknown): string {
  return getApiError(error).message;
}
