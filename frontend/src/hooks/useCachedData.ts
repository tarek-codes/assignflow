"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { getCached, invalidateCached, setCached } from "@/lib/dataCache";

type UseCachedDataOptions = {
  enabled?: boolean;
  deps?: unknown[];
};

export function useCachedData<T>(
  key: string,
  fetcher: () => Promise<T>,
  options?: UseCachedDataOptions
) {
  const enabled = options?.enabled ?? true;
  const deps = options?.deps ?? [];
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | undefined>(() => (enabled ? getCached<T>(key) : undefined));
  const [isLoading, setIsLoading] = useState(enabled && getCached<T>(key) === undefined);

  const refetch = useCallback(async () => {
    invalidateCached(key);
    setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      setCached(key, result);
      setData(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    const cached = getCached<T>(key);
    if (cached !== undefined) {
      setData(cached);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setCached(key, result);
        setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, key, ...deps]);

  return { data, isLoading, refetch };
}

export { invalidateCached, invalidateCachedPrefix } from "@/lib/dataCache";
