/**
 * Server-side in-memory cache for expensive API calls (e.g. Google Drive).
 * Lives as long as the Node.js process — effective in dev mode and
 * in serverless warm invocations on Vercel.
 */

interface CacheEntry {
  data: unknown;
  ts: number;
}

const store = new Map<string, CacheEntry>();

const DEFAULT_TTL = 2 * 60 * 1000; // 2 minutes

export function serverGet<T>(key: string, ttlMs = DEFAULT_TTL): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() - entry.ts > ttlMs) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function serverSet(key: string, data: unknown): void {
  store.set(key, { data, ts: Date.now() });
}

export function serverInvalidate(prefix?: string): void {
  if (!prefix) {
    store.clear();
    return;
  }
  Array.from(store.keys()).forEach((key) => {
    if (key.startsWith(prefix)) store.delete(key);
  });
}
