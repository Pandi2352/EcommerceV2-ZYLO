import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { getApiError, type ApiError } from '../services/api';

/**
 * Load data on mount and whenever `deps` change. Stale responses from earlier
 * requests are ignored, so fast filter changes cannot show outdated results.
 */
export function useApiQuery<T>(fetcher: () => Promise<T>, deps: readonly unknown[]) {
  const [data, setData] = useState<T | null>(null);
  const [error, setError] = useState<ApiError | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [reloadKey, setReloadKey] = useState(0);
  const fetcherRef = useRef(fetcher);
  useLayoutEffect(() => {
    fetcherRef.current = fetcher;
  });

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);

    fetcherRef.current()
      .then((result) => active && setData(result))
      .catch((err) => active && setError(getApiError(err)))
      .finally(() => active && setIsLoading(false));

    return () => {
      active = false;
    };
  }, [...deps, reloadKey]);

  const reload = useCallback(() => setReloadKey((key) => key + 1), []);

  return { data, error, isLoading, reload };
}
