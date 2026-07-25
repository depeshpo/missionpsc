"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";

/**
 * Hand-rolled toaster — no dependency. A module-level store (same
 * useSyncExternalStore pattern as useAdminChrome) feeds a single <Toaster />
 * viewport mounted once in the root layout, so `toast.*` works from any client
 * component on any surface.
 */
export type ToastVariant = "success" | "error" | "info";

export interface Toast {
  id: number;
  variant: ToastVariant;
  message: string;
  duration: number;
}

const DEFAULTS: Record<ToastVariant, number> = {
  success: 4000,
  info: 4000,
  error: 6000,
};
const MAX = 4;

let toasts: Toast[] = [];
let nextId = 1;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function add(variant: ToastVariant, message: string, duration?: number): number {
  const id = nextId++;
  toasts = [...toasts, { id, variant, message, duration: duration ?? DEFAULTS[variant] }];
  if (toasts.length > MAX) toasts = toasts.slice(toasts.length - MAX);
  emit();
  return id;
}

function dismiss(id: number) {
  toasts = toasts.filter((t) => t.id !== id);
  emit();
}

/** Fire a toast from any client component. */
export const toast = {
  success: (message: string, duration?: number) => add("success", message, duration),
  error: (message: string, duration?: number) => add("error", message, duration),
  info: (message: string, duration?: number) => add("info", message, duration),
  dismiss,
};

function subscribe(cb: () => void) {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

function useToasts(): Toast[] {
  return useSyncExternalStore(
    subscribe,
    () => toasts,
    () => toasts,
  );
}

const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
} as const;

const ACCENT: Record<ToastVariant, string> = {
  success: "text-success",
  error: "text-destructive",
  info: "text-primary",
};

function ToastRow({ toast: t }: { toast: Toast }) {
  const [leaving, setLeaving] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const Icon = ICONS[t.variant];

  // Play the exit animation, then remove from the store.
  function close() {
    if (leaving) return;
    setLeaving(true);
    setTimeout(() => dismiss(t.id), 160);
  }

  useEffect(() => {
    timer.current = setTimeout(close, t.duration);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg",
        leaving ? "animate-toast-out" : "animate-toast-in",
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ACCENT[t.variant])} />
      <p className="min-w-0 flex-1 text-sm leading-snug break-words">{t.message}</p>
      <button
        type="button"
        onClick={close}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/** Single viewport for all toasts. Mount once in the root layout. */
export function Toaster() {
  const items = useToasts();
  return (
    <div
      aria-live="polite"
      aria-relevant="additions"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[100] flex flex-col items-end gap-2 px-4 sm:left-auto sm:right-4 sm:px-0"
    >
      {items.map((t) => (
        <ToastRow key={t.id} toast={t} />
      ))}
    </div>
  );
}
