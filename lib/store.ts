'use client';

import { useCallback, useSyncExternalStore } from 'react';

// Tiny localStorage-backed store so client-only prefs hydrate without effects or mismatches.

const EVENT = 'pairwise:store';
const cache = new Map<string, { raw: string | null; value: unknown }>();

function read(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener('storage', cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener('storage', cb);
    window.removeEventListener(EVENT, cb);
  };
}

export function writeStored(key: string, value: unknown) {
  try {
    if (value === null) localStorage.removeItem(key);
    else localStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
  } catch {
    // Storage blocked: keep the value in memory for this visit.
    cache.set(key, { raw: '__memory__', value });
  }
  window.dispatchEvent(new Event(EVENT));
}

/** JSON (or plain string when `raw`) value from localStorage, `fallback` on the server and when unset. */
export function useStored<T>(key: string, fallback: T, raw = false): [T, (v: T | null) => void] {
  const value = useSyncExternalStore(
    subscribe,
    () => {
      const r = read(key);
      const hit = cache.get(key);
      if (hit && (hit.raw === r || hit.raw === '__memory__')) return hit.value as T;
      let v: T = fallback;
      if (r !== null) {
        try {
          v = raw ? (r as T) : (JSON.parse(r) as T);
        } catch {
          /* corrupt value: use fallback */
        }
      }
      cache.set(key, { raw: r, value: v });
      return v;
    },
    () => fallback,
  );
  const set = useCallback((v: T | null) => writeStored(key, v), [key]);
  return [value, set];
}
