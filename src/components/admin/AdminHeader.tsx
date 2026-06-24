"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";
import { cn } from "@/lib/cn";
import { setAdminChrome } from "@/lib/hooks/useAdminChrome";

/**
 * Admin page header. A compact bar (back + breadcrumbs + actions) stays pinned;
 * the big title + description scroll away. Once scrolled, the title condenses
 * inline next to the breadcrumbs so the pinned bar stays slim — reclaiming
 * vertical space on long pages.
 *
 * `floatCrumbs` (add/edit pages): the bar is NOT pinned (it scrolls away with the
 * title); once scrolled, the breadcrumb is published to the Topbar instead (see
 * `useAdminChrome`) so there's only one row of chrome.
 */
export function AdminHeader({
  title,
  description,
  breadcrumbs,
  actions,
  floatCrumbs = false,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  floatCrumbs?: boolean;
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
      // In floatCrumbs mode there's no pinned bar to slide under, so trigger as
      // the title leaves; otherwise offset by ~the pinned bar height.
      { root, rootMargin: floatCrumbs ? "0px" : "-56px 0px 0px 0px", threshold: 0 },
    );
    io.observe(node);
    return () => io.disconnect();
  }, [floatCrumbs]);

  // floatCrumbs: publish the breadcrumb to the Topbar while scrolled.
  React.useEffect(() => {
    if (!floatCrumbs) return;
    setAdminChrome(condensed ? { backHref, crumbs: breadcrumbs ?? [] } : null);
    return () => setAdminChrome(null);
  }, [floatCrumbs, condensed, backHref, breadcrumbs]);

  return (
    <>
      <div
        className={cn(
          "border-b border-border bg-background/80 backdrop-blur",
          !floatCrumbs && "sticky top-0 z-10",
        )}
      >
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
          {!floatCrumbs && condensed ? (
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
