import * as React from "react";
import { type Crumb } from "@/components/layout/Breadcrumbs";
import { AdminHeader } from "./AdminHeader";

/**
 * Admin page wrapper. A compact bar (back + breadcrumbs + actions) stays pinned
 * while the big title + description scroll away; once scrolled, the title
 * condenses inline next to the breadcrumbs (see AdminHeader). Used on admin
 * sub-pages instead of the shared PageShell so the learn surface is unaffected.
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
  return (
    <div>
      <AdminHeader
        title={title}
        description={description}
        breadcrumbs={breadcrumbs}
        actions={actions}
      />
      <div className="mx-auto w-full max-w-6xl px-6 py-6">{children}</div>
    </div>
  );
}
