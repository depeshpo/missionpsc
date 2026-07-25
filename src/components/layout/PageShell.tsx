import * as React from "react";
import { Breadcrumbs, type Crumb } from "./Breadcrumbs";

/**
 * Standard page wrapper: optional breadcrumbs, a title row with an actions
 * slot, and the page body. Use on every route for consistent spacing.
 */
export function PageShell({
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
  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      {breadcrumbs?.length ? (
        <div className="mb-3">
          <Breadcrumbs items={breadcrumbs} />
        </div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          {description ? (
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          ) : null}
        </div>
        {actions ? <div className="flex items-center gap-2">{actions}</div> : null}
      </div>
      <div className="animate-page-in mt-6">{children}</div>
    </div>
  );
}
