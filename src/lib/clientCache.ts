type CacheEntry = { value: unknown; expiresAt: number };

const cache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<unknown>>();

/** Deduplicates public GET requests during navigation and for a short freshness window. */
export async function cachedJson<T>(url: string, ttlMs = 60_000): Promise<T> {
  const now = Date.now();
  const existing = cache.get(url);
  if (existing && existing.expiresAt > now) return existing.value as T;

  const pending = inFlight.get(url);
  if (pending) return pending as Promise<T>;

  const request = fetch(url)
    .then(async (response) => {
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const value = (await response.json()) as T;
      cache.set(url, { value, expiresAt: Date.now() + ttlMs });
      return value;
    })
    .finally(() => inFlight.delete(url));

  inFlight.set(url, request);
  return request;
}

export function clearCachedJson(urlPrefix?: string) {
  if (!urlPrefix) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) if (key.startsWith(urlPrefix)) cache.delete(key);
}
