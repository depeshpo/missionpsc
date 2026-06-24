"use client";

import { useSyncExternalStore } from "react";
import type { Crumb } from "@/components/layout/Breadcrumbs";

/**
 * Tiny module-level store bridging an admin add/edit page's breadcrumb up to the
 * shared Topbar. On these pages the AdminHeader's own bar scrolls away; once
 * scrolled it publishes its crumbs here and the Topbar shows them next to a
 * shrunk search. Writing to this store from an effect is not a React state
 * dispatch, so it doesn't trip `react-hooks/set-state-in-effect`.
 */
export type AdminChrome = { backHref?: string; crumbs: Crumb[] } | null;

let state: AdminChrome = null;
const listeners = new Set<() => void>();

export function setAdminChrome(next: AdminChrome) {
  state = next;
  listeners.forEach((l) => l());
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useAdminChrome(): AdminChrome {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => null,
  );
}
