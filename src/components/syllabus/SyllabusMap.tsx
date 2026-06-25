"use client";

import type { Paper, Stage } from "@/lib/types";
import { PaperCard } from "./PaperCard";
import { Coverage } from "./Coverage";

type StageMeta = { id: Stage; title: string; subtitle: string };

/**
 * Reader for the syllabus index. Takes all papers (from the DB, via the server
 * page) + stage metadata. Stays a client component for the per-stage coverage
 * bar (localStorage progress).
 */
export function SyllabusMap({
  stages,
  papers,
}: {
  stages: StageMeta[];
  papers: Paper[];
}) {
  return (
    <div className="space-y-10">
      {stages.map((stage) => {
        const stagePapers = papers.filter((p) => p.stage === stage.id);
        const unitIds = stagePapers.flatMap((p) =>
          p.sections.flatMap((s) => s.units.map((u) => u.id)),
        );
        return (
          <section key={stage.id}>
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">{stage.title}</h2>
                <p className="text-sm text-muted-foreground">{stage.subtitle}</p>
              </div>
              <Coverage unitIds={unitIds} className="w-48" />
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {stagePapers.map((paper) => (
                <PaperCard key={paper.id} paper={paper} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
