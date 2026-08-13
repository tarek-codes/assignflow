"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCachedDataOptions = {
  enabled?: boolean;
  deps?: unknown[];
  retryCount?: number;
};

export function useCachedData<T>(
  _key: string,
  fetcher: () => Promise<T>,
  options?: UseCachedDataOptions
) {
  const enabled = options?.enabled ?? true;
  const deps = options?.deps ?? [];
  const maxRetries = options?.retryCount ?? 3;
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithRetry = useCallback(
    async (retries: number): Promise<T> => {
      try {
        return await fetcherRef.current();
      } catch (err) {
        if (retries > 0) {
          // Exponential backoff: 500ms, 1000ms, 2000ms
          const delay = 500 * Math.pow(2, maxRetries - retries);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1);
        }
        throw err;
      }
    },
    [maxRetries]
  );

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await fetchWithRetry(maxRetries);
      setData(result);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to fetch data"));
    } finally {
      setIsLoading(false);
    }
  }, [fetchWithRetry, maxRetries]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);
    setError(null);

    fetchWithRetry(maxRetries)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err instanceof Error ? err : new Error("Failed to fetch data"));
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, fetchWithRetry, maxRetries, ...deps]);

  return { data, isLoading, error, refetch };
}

export function invalidateCached(_key: string) {}
export function invalidateCachedPrefix(_prefix: string) {}
