"use client";

import { useSyncExternalStore } from "react";

/**
 * Returns false during SSR and the first client render, true after mount —
 * without a set-state-in-effect. Useful to gate client-only state (e.g. reading
 * a localStorage-backed value) so it initialises from hydrated data.
 */
export function useMounted() {
  return useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
}
