import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, PenLine } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPaper } from "@/data/syllabus";
import { questionsByPaper, questionsBySection, kindLabel } from "@/data/subjective";
import { AttemptedDot, AttemptedCount } from "@/components/answers/AttemptedBadge";

export default async function AnswersPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  const allIds = questionsByPaper(paper.id).map((q) => q.id);
  // Only show sections that actually have questions.
  const sections = paper.sections.filter((s) => questionsBySection(s.id).length > 0);

  return (
    <PageShell
      title={`Paper ${paper.code} — ${paper.title}`}
      description={paper.note}
      breadcrumbs={[{ label: "Answer Writing", href: "/answers" }, { label: paper.title }]}
      actions={<AttemptedCount questionIds={allIds} />}
    >
      {sections.length === 0 ? (
        <EmptyState
          icon={PenLine}
          title="No questions yet"
          description="This paper doesn't have an answer-writing bank. Questions are authored in src/data/subjective.ts."
        />
      ) : (
      <div className="space-y-5">
        {sections.map((section) => (
          <Card key={section.id}>
            <CardHeader className="flex flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-base">{section.label}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{section.marks} marks</Badge>
                {section.pattern ? <Badge>{section.pattern}</Badge> : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-1">
              {questionsBySection(section.id).map((q) => (
                <Link
                  key={q.id}
                  href={`/answers/${paper.id}/${q.id}`}
                  className="group flex items-center gap-3 rounded-lg px-2 py-2.5 hover:bg-muted/60"
                >
                  <AttemptedDot questionId={q.id} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-center gap-2">
                      <Badge variant="default">{kindLabel(q.kind)}</Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {q.marks} marks
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-sm">{q.prompt}</span>
                  </span>
                  <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </Link>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
      )}
    </PageShell>
  );
}
