'use client';

import { useState, useEffect, useCallback } from 'react';
import { fetchData, isDemoMode, FetchOptions } from './api-client';

export interface UseDataFetchResult<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  isDemo: boolean;
  refetch: () => Promise<void>;
}

/**
 * Custom React hook for conditional data fetching.
 * Seamlessly integrates `process.env.NEXT_PUBLIC_DEMO_MODE` into UI components.
 *
 * @example
 * ```tsx
 * const { data: flocks, loading, error, refetch } = useDataFetch<IFlock[]>('/api/flocks');
 * ```
 */
export function useDataFetch<T = unknown>(
  url: string | null,
  options?: FetchOptions<T>
): UseDataFetchResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  const isDemo = isDemoMode();

  const loadData = useCallback(async () => {
    if (!url) {
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await fetchData<T>(url, options);
      setData(result);
    } catch (err: unknown) {
      const resolvedErr =
        err instanceof Error ? err : new Error('ডেটা লোড করতে ব্যর্থ হয়েছে');
      setError(resolvedErr);
    } finally {
      setLoading(false);
    }
  }, [url, JSON.stringify(options?.body), options?.method]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return {
    data,
    loading,
    error,
    isDemo,
    refetch: loadData,
  };
}
