"use client";

import { useCallback, useSyncExternalStore } from "react";

/**
 * localStorage-backed state for ephemeral v1 "progress" (completed units,
 * quiz scores, flashcard state, bookmarks) until a real DB is added.
 *
 * Uses useSyncExternalStore so reads are SSR-safe: the server snapshot is the
 * `initial` value, and the client re-reads from storage after hydration and
 * stays in sync across tabs via the `storage` event.
 */
function subscribe(callback: () => void) {
  window.addEventListener("storage", callback);
  window.addEventListener("mission-psc:local", callback as EventListener);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("mission-psc:local", callback as EventListener);
  };
}

// Cache parsed snapshots by their raw string so useSyncExternalStore receives
// a referentially-stable value when storage hasn't changed (required to avoid
// an infinite re-render loop for object/array values).
const snapshotCache = new Map<string, { raw: string | null; parsed: unknown }>();

function read<T>(storageKey: string, initial: T): T {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(storageKey);
  } catch {
    return initial;
  }

  const cached = snapshotCache.get(storageKey);
  if (cached && cached.raw === raw) return cached.parsed as T;

  // Cache the resolved snapshot (including the empty case) so the reference is
  // stable across renders until the underlying storage string changes.
  let parsed: T;
  try {
    parsed = raw === null ? initial : (JSON.parse(raw) as T);
  } catch {
    parsed = initial;
  }
  snapshotCache.set(storageKey, { raw, parsed });
  return parsed;
}

function write<T>(storageKey: string, value: T) {
  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
    // Notify same-tab subscribers (the native `storage` event is cross-tab only).
    window.dispatchEvent(new Event("mission-psc:local"));
  } catch {
    // ignore quota/availability errors
  }
}

export function useLocalProgress<T>(key: string, initial: T) {
  const storageKey = `mission-psc:${key}`;

  const value = useSyncExternalStore(
    subscribe,
    () => read(storageKey, initial),
    () => initial, // server snapshot
  );

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function"
          ? (next as (prev: T) => T)(read(storageKey, initial))
          : next;
      write(storageKey, resolved);
    },
    [storageKey, initial],
  );

  return [value, setValue] as const;
}

/**
 * Convenience wrapper for a set of string ids (e.g. completed unit ids),
 * stored as an array. Returns the set plus a toggle and membership check.
 */
export function useLocalIdSet(key: string) {
  const [ids, setIds] = useLocalProgress<string[]>(key, []);

  const has = useCallback((id: string) => ids.includes(id), [ids]);

  const toggle = useCallback(
    (id: string) =>
      setIds((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      ),
    [setIds],
  );

  return { ids, has, toggle };
}
