"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type UseCachedDataOptions = {
  enabled?: boolean;
  deps?: unknown[];
};

export function useCachedData<T>(
  _key: string,
  fetcher: () => Promise<T>,
  options?: UseCachedDataOptions
) {
  const enabled = options?.enabled ?? true;
  const deps = options?.deps ?? [];
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [data, setData] = useState<T | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(enabled);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await fetcherRef.current();
      setData(result);
      return result;
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    setIsLoading(true);

    fetcherRef
      .current()
      .then((result) => {
        if (cancelled) return;
        setData(result);
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [enabled, ...deps]);

  return { data, isLoading, refetch };
}

export function invalidateCached(_key: string) {}
export function invalidateCachedPrefix(_prefix: string) {}
