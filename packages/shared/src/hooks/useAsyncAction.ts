import { useCallback, useLayoutEffect, useRef, useState } from 'react';
import { getApiError, type ApiError } from '../api/client';

/**
 * Wrap an async action (typically an API call) with loading and error state.
 * `run` resolves to the action's result, or undefined if it failed.
 */
export function useAsyncAction<Args extends unknown[], Result>(action: (...args: Args) => Promise<Result>) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  // Keep the latest action without changing `run`'s identity
  const actionRef = useRef(action);
  useLayoutEffect(() => {
    actionRef.current = action;
  });

  const run = useCallback(async (...args: Args): Promise<Result | undefined> => {
    setIsLoading(true);
    setError(null);
    try {
      return await actionRef.current(...args);
    } catch (err) {
      setError(getApiError(err));
      return undefined;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return { run, isLoading, error, clearError };
}
