import { Hammer } from "lucide-react";
import { PageShell } from "./PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Crumb } from "./Breadcrumbs";

/** Placeholder page used during Phase 0 until a feature is built out. */
export function ComingSoon({
  title,
  description,
  breadcrumbs,
  note = "This screen is a placeholder. We're building features one at a time — see docs/PLAN.md for the order.",
}: {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  note?: string;
}) {
  return (
    <PageShell title={title} description={description} breadcrumbs={breadcrumbs}>
      <EmptyState icon={Hammer} title="Coming soon" description={note} />
    </PageShell>
  );
}
