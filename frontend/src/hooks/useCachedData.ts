"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCachedDataOptions = {
  enabled?: boolean;
  deps?: unknown[];
  retryCount?: number;
  ttlMs?: number; // Time-to-live in ms (default: 5 minutes)
};

// Global in-memory browser cache store
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseCachedDataOptions
) {
  const enabled = options?.enabled ?? true;
  const deps = options?.deps ?? [];
  const maxRetries = options?.retryCount ?? 3;
  const ttlMs = options?.ttlMs ?? 5 * 60 * 1000; // 5 minutes default TTL

  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // Check if cache has valid non-expired data immediately for instant render
  const cached = memoryCache.get(key);
  const isCacheValid = cached && Date.now() - cached.timestamp < ttlMs;

  const [data, setData] = useState<T | undefined>(
    isCacheValid ? (cached.data as T) : undefined
  );
  const [isLoading, setIsLoading] = useState(enabled && !isCacheValid);
  const [error, setError] = useState<Error | null>(null);

  const fetchWithRetry = useCallback(
    async (retries: number): Promise<T> => {
      try {
        const result = await fetcherRef.current();
        memoryCache.set(key, { data: result, timestamp: Date.now() });
        return result;
      } catch (err) {
        if (retries > 0) {
          const delay = 500 * Math.pow(2, maxRetries - retries);
          await new Promise((resolve) => setTimeout(resolve, delay));
          return fetchWithRetry(retries - 1);
        }
        throw err;
      }
    },
    [key, maxRetries]
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

    // If cache is valid, skip fetching completely on tab switch!
    const currentCached = memoryCache.get(key);
    if (currentCached && Date.now() - currentCached.timestamp < ttlMs) {
      setData(currentCached.data as T);
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
  }, [enabled, key, ttlMs, fetchWithRetry, maxRetries, ...deps]);

  return { data, isLoading, error, refetch };
}

export function invalidateCached(key: string) {
  memoryCache.delete(key);
}

export function invalidateCachedPrefix(prefix: string) {
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
}
