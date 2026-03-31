interface CacheEntry<T> {
  value: T;
  timestamp: number;
}

const cache = new Map<string, CacheEntry<unknown>>();
const MAX_CACHE_SIZE = 500;
const CACHE_TTL_MS = 60_000; // 1 minute

export function getCached<T>(key: string): T | undefined {
  const entry = cache.get(key);
  if (!entry) return undefined;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    cache.delete(key);
    return undefined;
  }
  return entry.value as T;
}

export function setCache<T>(key: string, value: T): void {
  if (cache.size >= MAX_CACHE_SIZE) {
    // Evict oldest entry
    const firstKey = cache.keys().next().value;
    if (firstKey) cache.delete(firstKey);
  }
  cache.set(key, { value, timestamp: Date.now() });
}

export function clearTypeCache(): void {
  cache.clear();
}

export function generateCacheKey(columnName: string, sampleValues: unknown[]): string {
  const sampleHash = sampleValues
    .slice(0, 5)
    .map(v => typeof v + ':' + String(v).slice(0, 20))
    .join('|');
  return `${columnName}::${sampleHash}`;
}
