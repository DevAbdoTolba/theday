// Safe localStorage helpers to use in browser-only code paths
// Avoids crashes during SSR and on restricted environments

export const isBrowser = typeof window !== "undefined" && typeof localStorage !== "undefined";

export function getItem(key: string): string | null {
  if (!isBrowser) return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function setItem(key: string, value: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // ignore write errors
  }
}

export function getJSON<T>(key: string, fallback: T): T {
  const raw = getItem(key);
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function setJSON(key: string, value: unknown): void {
  try {
    setItem(key, JSON.stringify(value));
  } catch {
    // ignore
  }
}

// Remove a key from storage safely
export function removeItem(key: string): void {
  if (!isBrowser) return;
  try {
    window.localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// Check if a key exists in storage
export function hasItem(key: string): boolean {
  return getItem(key) !== null;
}
