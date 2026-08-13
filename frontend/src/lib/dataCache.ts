export const CACHE_TTL_MS = 0;

export function getCached<T>(_key: string): T | undefined {
  return undefined;
}

export function setCached(_key: string, _data: unknown, _ttl = CACHE_TTL_MS) {}

export function invalidateCached(_key: string) {}

export function invalidateCachedPrefix(_prefix: string) {}
