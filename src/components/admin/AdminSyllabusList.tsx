"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import type { Paper, Stage } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  resolveAllPapers,
  useSyllabusOverrides,
} from "@/lib/hooks/useSyllabusPaper";

type StageMeta = { id: Stage; title: string; subtitle: string };

/**
 * Admin syllabus list. Resolves seed papers against the override map and folds
 * in any created-from-scratch papers, so admin edits and brand-new papers both
 * show up here.
 */
export function AdminSyllabusList({
  stages,
  papers,
}: {
  stages: StageMeta[];
  papers: Paper[];
}) {
  const overrides = useSyllabusOverrides();
  const resolved = resolveAllPapers(overrides, papers);

  return (
    <div className="space-y-8">
      {stages.map((stage) => {
        const stagePapers = resolved.filter((p) => p.stage === stage.id);
        if (!stagePapers.length) return null;
        return (
          <section key={stage.id} className="space-y-3">
            <div>
              <h2 className="text-sm font-semibold tracking-tight">{stage.title}</h2>
              <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {stagePapers.map((p) => {
                const units = p.sections.reduce((n, s) => n + s.units.length, 0);
                return (
                  <Link
                    key={p.id}
                    href={`/admin/syllabus/${p.id}`}
                    className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
                      <CardContent className="flex h-full items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <Badge variant="outline">Paper {p.code}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {p.totalMarks} marks
                            </span>
                          </div>
                          <h3 className="mt-1.5 truncate font-semibold tracking-tight">
                            {p.title}
                          </h3>
                          <p className="mt-0.5 text-sm text-muted-foreground">
                            {p.sections.length} sections · {units} units
                          </p>
                        </div>
                        <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
