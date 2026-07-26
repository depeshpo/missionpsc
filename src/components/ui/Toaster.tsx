"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { cn } from "@/lib/cn";
import { useToasts, dismissToast, type Toast, type ToastVariant } from "@/lib/toast";

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

/**
 * Pure render — no timers. All auto-dismiss timing lives in the store (see
 * lib/toast.ts); this just reflects `leaving` into the exit animation and lets
 * the close button dismiss.
 */
function ToastRow({ toast: t }: { toast: Toast }) {
  const Icon = ICONS[t.variant];
  return (
    <div
      role="status"
      className={cn(
        "pointer-events-auto flex w-80 max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border border-border bg-card p-3 shadow-lg",
        t.leaving ? "animate-toast-out" : "animate-toast-in",
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", ACCENT[t.variant])} />
      <p className="min-w-0 flex-1 text-sm leading-snug break-words">{t.message}</p>
      <button
        type="button"
        onClick={() => dismissToast(t.id)}
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
