"use client";

import Link from "next/link";
import { ChevronRight, PenLine, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPaper } from "@/data/syllabus";
import { kindLabel } from "@/data/subjective";
import {
  useSubjectiveQuestions,
  questionsByPaperFrom,
  questionsBySectionFrom,
} from "@/lib/hooks/useSubjectiveQuestions";
import { AttemptedDot, AttemptedCount } from "@/components/answers/AttemptedBadge";

/** Public per-paper answer list, resolved through the override. */
export function AnswersPaper({ paperId }: { paperId: string }) {
  const list = useSubjectiveQuestions();
  const paper = getPaper(paperId);

  if (!paper) {
    return (
      <PageShell
        title="Paper not found"
        breadcrumbs={[{ label: "Answer Writing", href: "/answers" }]}
      >
        <EmptyState
          icon={PenLine}
          title="This paper is not available"
          description="Browse the papers with an answer-writing bank."
          action={
            <Link
              href="/answers"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Answer Writing
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageShell>
    );
  }

  const allIds = questionsByPaperFrom(list, paper.id).map((q) => q.id);
  // Only show sections that actually have questions.
  const sections = paper.sections.filter(
    (s) => questionsBySectionFrom(list, s.id).length > 0,
  );

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
          description="This paper doesn't have an answer-writing bank yet."
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
                {questionsBySectionFrom(list, section.id).map((q) => (
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
