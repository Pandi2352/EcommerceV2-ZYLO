import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

type Updates = Record<string, string | number | null | undefined>;

/**
 * List-page state (filters, sort, page, page size) kept in the URL query string,
 * so views survive refresh and can be shared. Changing anything other than
 * `page` resets to page 1.
 */
export function useQueryState<K extends string>(defaults: Partial<Record<K, string>> = {}) {
  const [searchParams, setSearchParams] = useSearchParams();

  const get = useCallback(
    (key: K): string => searchParams.get(key) ?? defaults[key] ?? '',
    [searchParams, defaults],
  );

  const set = useCallback(
    (updates: Partial<Record<K | 'page', Updates[string]>>) => {
      setSearchParams(
        (prev) => {
          const next = new URLSearchParams(prev);
          for (const [key, value] of Object.entries(updates)) {
            if (value === null || value === undefined || value === '') next.delete(key);
            else next.set(key, String(value));
          }
          if (!('page' in updates)) next.delete('page');
          return next;
        },
        { replace: true },
      );
    },
    [setSearchParams],
  );

  const page = Math.max(1, Number(searchParams.get('page')) || 1);
  const hasFilters = useMemo(() => [...searchParams.keys()].some((k) => k !== 'page' && k !== 'size' && k !== 'sort'), [searchParams]);

  return { get, set, page, hasFilters, searchParams };
}

export default useQueryState;
