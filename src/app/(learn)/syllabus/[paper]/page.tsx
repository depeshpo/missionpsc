import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPaper } from "@/data/syllabus";
import { UnitCheckbox } from "@/components/syllabus/UnitCheckbox";
import { Coverage } from "@/components/syllabus/Coverage";

export default async function SyllabusPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

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
