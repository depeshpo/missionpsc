"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw } from "lucide-react";

/**
 * Runtime error boundary. The most likely cause here is Supabase being
 * unreachable — the free-tier project pauses after about a week idle, and every
 * page reads from it — so the copy names that instead of showing a bare stack.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-warning/15 text-warning">
          <AlertTriangle className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          This page couldn&apos;t load. If it keeps happening, the database may be paused —
          check the project in your Supabase dashboard and hit Restore.
        </p>
        {error.digest ? (
          <p className="mt-2 font-mono text-xs text-muted-foreground">ref: {error.digest}</p>
        ) : null}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <RotateCcw className="h-4 w-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Back to dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
