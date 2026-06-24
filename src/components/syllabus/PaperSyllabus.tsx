"use client";

import Link from "next/link";
import { ChevronRight, ArrowRight, FileX } from "lucide-react";
import type { Paper } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";
import { resolvePaper, useSyllabusOverrides } from "@/lib/hooks/useSyllabusPaper";
import { useMounted } from "@/lib/hooks/useMounted";
import { UnitCheckbox } from "./UnitCheckbox";
import { Coverage } from "./Coverage";

/**
 * Client reader for a single paper. Resolves the seed against the admin override
 * map (so edits render), and falls back to an override-only paper when there is
 * no seed — i.e. a paper created in the admin. A missing id shows an empty state.
 */
export function PaperSyllabus({
  paperId,
  seed,
}: {
  paperId: string;
  seed?: Paper;
}) {
  const overrides = useSyllabusOverrides();
  const mounted = useMounted();
  const paper = seed ? resolvePaper(overrides, seed) : overrides[paperId];

  if (!paper) {
    if (!mounted) {
      return (
        <PageShell title="Paper" breadcrumbs={[{ label: "Syllabus", href: "/syllabus" }]}>
          <Skeleton className="h-40 w-full rounded-xl" />
        </PageShell>
      );
    }
    return (
      <PageShell
        title="Paper not found"
        breadcrumbs={[{ label: "Syllabus", href: "/syllabus" }]}
      >
        <EmptyState
          icon={FileX}
          title="This paper isn’t in the syllabus"
          description="It may have been removed. Head back to see the current papers."
          action={
            <Link
              href="/syllabus"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Syllabus
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageShell>
    );
  }

  const unitIds = paper.sections.flatMap((s) => s.units.map((u) => u.id));
  const meta = [
    paper.note,
    `${paper.totalMarks} marks`,
    paper.durationMins ? `${paper.durationMins} min` : null,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <PageShell
      title={`Paper ${paper.code} — ${paper.title}`}
      description={meta}
      breadcrumbs={[{ label: "Syllabus", href: "/syllabus" }, { label: paper.title }]}
      actions={<Coverage unitIds={unitIds} className="w-44" />}
    >
      <div className="space-y-5">
        {paper.sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{section.label}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{section.marks} marks</Badge>
                {section.pattern ? <Badge>{section.pattern}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {section.units.map((unit) => (
                <div
                  key={unit.id}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-muted/60"
                >
                  <UnitCheckbox unitId={unit.id} />
                  <Link
                    href={`/syllabus/${paper.id}/${unit.id}`}
                    className="group flex min-w-0 flex-1 items-center justify-between gap-3"
                  >
                    <span className="min-w-0">
                      <span className="font-medium">
                        {unit.number !== "—" ? `${unit.number}. ` : ""}
                        {unit.title}
                      </span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {unit.subtopics.length} subtopic
                        {unit.subtopics.length > 1 ? "s" : ""}
                      </span>
                    </span>
                    <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  );
}
