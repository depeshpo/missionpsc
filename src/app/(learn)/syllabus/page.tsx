import { PageShell } from "@/components/layout/PageShell";
import { STAGES, papersByStage } from "@/data/syllabus";
import { PaperCard } from "@/components/syllabus/PaperCard";
import { Coverage } from "@/components/syllabus/Coverage";

export default function SyllabusPage() {
  return (
    <PageShell
      title="Syllabus Map"
      description="The full Stage → Paper → Section → Unit map with marks weights. Tick units as you cover them to track progress."
    >
      <div className="space-y-10">
        {STAGES.map((stage) => {
          const papers = papersByStage(stage.id);
          const unitIds = papers.flatMap((p) =>
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
                {papers.map((paper) => (
                  <PaperCard key={paper.id} paper={paper} />
                ))}
              </div>
            </section>
          );
        })}
      </div>
    </PageShell>
  );
}
