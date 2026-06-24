"use client";

import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { Breadcrumbs } from "./Breadcrumbs";
import { useAdminChrome } from "@/lib/hooks/useAdminChrome";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  const pathname = usePathname();
  // On admin add/edit pages, the page floats its breadcrumb up here while scrolled.
  const chrome = useAdminChrome();
  // Shrink the search when inside an admin menu (deep admin routes only).
  const compact = pathname.startsWith("/admin/");

  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur">
      {chrome ? (
        // Floated breadcrumb: collapse the search to an icon and show the trail.
        <div className="flex min-w-0 flex-1 items-center gap-2">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-border bg-card text-muted-foreground">
            <Search className="h-4 w-4" />
          </span>
          {chrome.backHref ? (
            <Link
              href={chrome.backHref}
              aria-label="Back"
              className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <ArrowLeft className="h-4 w-4" />
            </Link>
          ) : null}
          <div className="min-w-0 truncate">
            <Breadcrumbs items={chrome.crumbs} />
          </div>
        </div>
      ) : (
        <div className="flex flex-1 items-center">
          <div
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground transition-[max-width]",
              compact ? "max-w-xs" : "max-w-md",
            )}
          >
            <Search className="h-4 w-4 shrink-0" />
            <span className="truncate">Search syllabus, questions, notes…</span>
          </div>
        </div>
      )}
      <ThemeToggle />
      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
        DP
      </span>
    </header>
  );
}
