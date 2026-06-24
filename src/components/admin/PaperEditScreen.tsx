"use client";

import Link from "next/link";
import { FileX } from "lucide-react";
import type { Paper } from "@/lib/types";
import { AdminPageShell } from "./AdminPageShell";
import { PaperForm } from "./PaperForm";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { useSyllabusOverrides } from "@/lib/hooks/useSyllabusPaper";
import { useMounted } from "@/lib/hooks/useMounted";

const baseCrumbs = [
  { label: "Admin", href: "/admin" },
  { label: "Syllabus", href: "/admin/syllabus" },
];

/**
 * Owns the admin shell for the paper edit form so it can resolve papers that
 * exist only in the override map (created from scratch, no seed).
 */
export function PaperEditScreen({
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
          floatCrumbs
          title="Edit paper"
          breadcrumbs={[...baseCrumbs, { label: "…" }]}
        >
          <Skeleton className="h-64 w-full rounded-xl" />
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
      floatCrumbs
      title={`Edit ${paper.title}`}
      description={`Paper ${paper.code} · ${paper.totalMarks} marks`}
      breadcrumbs={[
        ...baseCrumbs,
        { label: `Paper ${paper.code}`, href: `/admin/syllabus/${paper.id}` },
        { label: "Edit" },
      ]}
    >
      <PaperForm initial={paper} />
    </AdminPageShell>
  );
}
