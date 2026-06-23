"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";

/**
 * Admin page header. A compact bar (back + breadcrumbs + actions) stays pinned;
 * the big title + description scroll away. Once scrolled, the title condenses
 * inline next to the breadcrumbs so the pinned bar stays slim — reclaiming
 * vertical space on long pages (esp. the add/edit forms).
 */
export function AdminHeader({
  title,
  description,
  breadcrumbs,
  actions,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
}) {
  const backHref = breadcrumbs?.filter((c) => c.href).at(-1)?.href;
  const [condensed, setCondensed] = React.useState(false);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const root = node.closest("main");
    const io = new IntersectionObserver(
      ([entry]) => setCondensed(!entry.isIntersecting),
      // ~56px ≈ compact bar height, so the title condenses right as it slides
      // under the pinned bar.
      { root, rootMargin: "-56px 0px 0px 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-2 px-6 py-3">
          {backHref ? (
            <Link
              href={backHref}
              aria-label="Back"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
          {breadcrumbs?.length ? <Breadcrumbs items={breadcrumbs} /> : null}
          {condensed ? (
            <span className="flex min-w-0 items-center gap-1 text-sm">
              <ChevronRight className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">{title}</span>
            </span>
          ) : null}
          {actions ? (
            <div className="ml-auto flex shrink-0 items-center gap-2">{actions}</div>
          ) : null}
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 pt-5">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        {description ? (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div ref={sentinelRef} aria-hidden className="h-0" />
    </>
  );
}
