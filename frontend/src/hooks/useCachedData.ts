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

// Global event listeners for active components to subscribe to real-time cache mutations & invalidations
type CacheSubscriber = (invalidatedPrefix: string, updatedData?: unknown) => void;
const cacheSubscribers = new Set<CacheSubscriber>();

function notifySubscribers(prefix: string, updatedData?: unknown) {
  cacheSubscribers.forEach((cb) => {
    try {
      cb(prefix, updatedData);
    } catch {
      // Ignore subscriber errors
    }
  });
}

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

    // Stale-While-Revalidate (SWR): if cache is valid or present, serve it immediately
    const currentCached = memoryCache.get(key);
    const isFresh = currentCached && Date.now() - currentCached.timestamp < ttlMs;

    if (currentCached) {
      setData(currentCached.data as T);
      setIsLoading(false);
      if (isFresh) return;
    } else {
      setIsLoading(true);
    }

    let cancelled = false;
    setError(null);

    fetchWithRetry(maxRetries)
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch((err) => {
        if (cancelled) return;
        if (!currentCached) {
          setError(err instanceof Error ? err : new Error("Failed to fetch data"));
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, key, ttlMs, fetchWithRetry, maxRetries, ...deps]);

  // Real-time reactive cache subscription: components re-fetch instantly when cache is mutated/invalidated
  useEffect(() => {
    if (!enabled) return;

    const handleCacheChange: CacheSubscriber = (prefix, updatedData) => {
      const isMatch =
        prefix === "" ||
        key.startsWith(prefix) ||
        prefix.startsWith(key) ||
        key === prefix;

      if (isMatch) {
        if (updatedData !== undefined && key === prefix) {
          setData(updatedData as T);
        } else {
          void refetch();
        }
      }
    };

    cacheSubscribers.add(handleCacheChange);
    return () => {
      cacheSubscribers.delete(handleCacheChange);
    };
  }, [enabled, key, refetch]);

  return { data, isLoading, error, refetch };
}

export function getCachedData<T>(key: string, ttlMs = 5 * 60 * 1000): T | undefined {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < ttlMs) {
    return cached.data as T;
  }
  return undefined;
}

export async function fetchCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttlMs = 5 * 60 * 1000
): Promise<T> {
  const existing = getCachedData<T>(key, ttlMs);
  if (existing !== undefined) return existing;
  try {
    const data = await fetcher();
    memoryCache.set(key, { data, timestamp: Date.now() });
    return data;
  } catch (err) {
    console.error(`Failed to prefetch ${key}:`, err);
    throw err;
  }
}

export function invalidateCached(key: string) {
  memoryCache.delete(key);
  notifySubscribers(key);
}

export function invalidateCachedPrefix(prefix: string) {
  if (!prefix || prefix === "") {
    memoryCache.clear();
    notifySubscribers("");
    return;
  }
  for (const k of memoryCache.keys()) {
    if (k.startsWith(prefix)) {
      memoryCache.delete(k);
    }
  }
  notifySubscribers(prefix);
}

export function mutateCache<T>(
  key: string,
  dataOrUpdater: T | ((prev: T | undefined) => T)
) {
  const current = memoryCache.get(key);
  const oldVal = current ? (current.data as T) : undefined;
  const newVal =
    typeof dataOrUpdater === "function"
      ? (dataOrUpdater as (prev: T | undefined) => T)(oldVal)
      : dataOrUpdater;

  memoryCache.set(key, { data: newVal, timestamp: Date.now() });
  notifySubscribers(key, newVal);
}
