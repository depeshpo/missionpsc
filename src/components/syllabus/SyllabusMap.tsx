"use client";

import type { Paper, Stage } from "@/lib/types";
import {
  resolveAllPapers,
  useSyllabusOverrides,
} from "@/lib/hooks/useSyllabusPaper";
import { PaperCard } from "./PaperCard";
import { Coverage } from "./Coverage";

type StageMeta = { id: Stage; title: string; subtitle: string };

/**
 * Client reader for the syllabus index. Takes all seed papers + stage metadata
 * from the server page and resolves each paper through the admin override map,
 * so edited/reordered papers show up here too.
 */
export function SyllabusMap({
  stages,
  papers,
}: {
  stages: StageMeta[];
  papers: Paper[];
}) {
  const overrides = useSyllabusOverrides();
  const resolved = resolveAllPapers(overrides, papers);

  return (
    <div className="space-y-10">
      {stages.map((stage) => {
        const stagePapers = resolved.filter((p) => p.stage === stage.id);
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
