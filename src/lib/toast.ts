"use client";

import { useSyncExternalStore } from "react";

/**
 * Hand-rolled toast store — no dependency. A module-level store (same
 * useSyncExternalStore pattern as useAdminChrome) feeds a single <Toaster />
 * viewport (src/components/ui/Toaster.tsx) mounted once in the root layout, so
 * `toast.*` works from any client component on any surface.
 *
 * All timing (auto-dismiss + exit animation) lives HERE, at module level, not in
 * the row component. A component-level auto-dismiss timer gets corrupted by React
 * Strict Mode's mount→unmount→remount in dev (and any remount), which was
 * dismissing toasts the instant they appeared. Module-level timers are immune.
 *
 * Store and viewport are split across two files on purpose: mixing a React
 * component export with this value export in one module breaks Fast Refresh
 * (full reloads + duplicated module instances).
 */
export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  /** Set true just before removal so the row can play its exit animation. */
  leaving?: boolean;
}

const DEFAULTS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
};
const EXIT_MS = 180; // must match the animate-toast-out duration
const MAX = 4;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function remove(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

function beginLeave(id: number) {
  let found = false;
  toasts = toasts.map((t) => {
    if (t.id !== id || t.leaving) return t;
    found = true;
    return { ...t, leaving: true };
  });
  if (!found) return;
  emit();
  setTimeout(() => remove(id), EXIT_MS);
}

function add(variant: ToastVariant, message: string, duration?: number): number {
  const id = nextId++;
  toasts = [...toasts, { id, variant, message }];
  if (toasts.length > MAX) toasts = toasts.slice(toasts.length - MAX);
  emit();
  setTimeout(() => beginLeave(id), duration ?? DEFAULTS[variant]);
  return id;
}

/** Dismiss now (with the exit animation) — used by the row's close button. */
export function dismissToast(id: number) {
  beginLeave(id);
}

/** Fire a toast from any client component. */
export const toast = {
  success: (message: string, duration?: number) => add("success", message, duration),
  error: (message: string, duration?: number) => add("error", message, duration),
  info: (message: string, duration?: number) => add("info", message, duration),
  dismiss: dismissToast,
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

/** Subscribe a component to the toast list. */
export function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  );
}
