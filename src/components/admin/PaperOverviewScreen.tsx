"use client";

import Link from "next/link";
import { Pencil, FileX } from "lucide-react";
import type { Paper } from "@/lib/types";
import { AdminPageShell } from "./AdminPageShell";
import { PaperOverview } from "./PaperOverview";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSyllabusOverrides } from "@/lib/hooks/useSyllabusPaper";
import { useMounted } from "@/lib/hooks/useMounted";

const baseCrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Syllabus", href: "/admin/syllabus" },
];

/**
 * Owns the admin shell for a paper overview so it can resolve papers that exist
 * only in the override map (created from scratch, no seed). Seed papers render
 * straight away; created papers appear after localStorage hydration.
 */
export function PaperOverviewScreen({
  paperId,
  seed,
}: {
  paperId: string;
  seed?: Paper;
}) {
  const overrides = useSyllabusOverrides();
  const mounted = useMounted();
  const paper = seed ? overrides[paperId] ?? seed : overrides[paperId];

  if (!paper) {
    if (!mounted) {
      return (
        <AdminPageShell
          title="Paper"
          breadcrumbs={[...baseCrumbs, { label: "…" }]}
        >
          <Skeleton className="h-40 w-full rounded-xl" />
        </AdminPageShell>
      );
    }
    return (
      <AdminPageShell title="Paper not found" breadcrumbs={[...baseCrumbs, { label: "Not found" }]}>
        <EmptyState
          icon={FileX}
          title="This paper doesn’t exist"
          description="It may have been deleted, or the link is out of date."
          action={
            <Link
              href="/admin/syllabus"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Syllabus
            </Link>
          }
        />
      </AdminPageShell>
    );
  }

  return (
    <AdminPageShell
      title={paper.title}
      description={`Paper ${paper.code} · ${paper.totalMarks} marks`}
      breadcrumbs={[...baseCrumbs, { label: `Paper ${paper.code}` }]}
      actions={
        <Link
          href={`/admin/syllabus/${paper.id}/edit`}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Pencil className="h-4 w-4" />
          Edit paper
        </Link>
      }
    >
      <PaperOverview seed={paper} created={!seed} />
    </AdminPageShell>
  );
}
