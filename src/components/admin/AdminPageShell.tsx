import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Breadcrumbs, type Crumb } from "@/components/layout/Breadcrumbs";

/**
 * Admin page wrapper with a sticky header (back + breadcrumbs + title + actions)
 * that stays pinned while the body scrolls. Used on admin sub-pages instead of
 * the shared PageShell so the learn surface is unaffected. The Back target is
 * derived from the breadcrumb trail (the last crumb that has an href = parent).
 */
export function AdminPageShell({
  title,
  description,
  breadcrumbs,
  actions,
  children,
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: React.ReactNode;
  children?: React.ReactNode;
}) {
  const backHref = breadcrumbs?.filter((c) => c.href).at(-1)?.href;

  return (
    <div>
      <div className="sticky top-0 z-10 border-b border-border bg-background/80 backdrop-blur">
        <div className="mx-auto w-full max-w-6xl px-6 py-3">
          <div className="flex items-center gap-2">
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
          </div>
          <div className="mt-2 flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0">
              <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
              {description ? (
                <p className="mt-1 text-sm text-muted-foreground">{description}</p>
              ) : null}
            </div>
            {actions ? (
              <div className="flex items-center gap-2">{actions}</div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
    </div>
  );
}
