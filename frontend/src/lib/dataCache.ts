const cache = new Map<string, { data: unknown; expires: number }>();

export const CACHE_TTL_MS = 5 * 60 * 1000;

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry || Date.now() > entry.expires) {
    cache.delete(key);
    return undefined;
  }
  return entry.data as T;
}

export function setCached(key: string, data: unknown, ttl = CACHE_TTL_MS) {
  cache.set(key, { data, expires: Date.now() + ttl });
}

export function invalidateCached(key: string) {
  cache.delete(key);
}

export function invalidateCachedPrefix(prefix: string) {
  for (const key of cache.keys()) {
    if (key.startsWith(prefix)) cache.delete(key);
  }
}
