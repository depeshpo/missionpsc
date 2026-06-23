"use client";

import Link from "next/link";
import { ArrowRight, PenLine } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPaper } from "@/data/syllabus";
import { kindLabel } from "@/data/subjective";
import { useSubjectiveQuestions } from "@/lib/hooks/useSubjectiveQuestions";
import { AnswerEditor } from "@/components/answers/AnswerEditor";
import { ModelAnswer } from "@/components/answers/ModelAnswer";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

/** Public question detail, resolved through the override (admin-added Qs are viewable). */
export function AnswerDetail({
  paperId,
  questionId,
}: {
  paperId: string;
  questionId: string;
}) {
  const list = useSubjectiveQuestions();
  const question = list.find((q) => q.id === questionId);
  const paper = question ? getPaper(question.paperId) : undefined;

  if (!question || question.paperId !== paperId || !paper) {
    return (
      <PageShell
        title="Question not available"
        breadcrumbs={[{ label: "Answer Writing", href: "/answers" }]}
      >
        <EmptyState
          icon={PenLine}
          title="This question is no longer available"
          description="It may have been removed. Browse the available questions."
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

  return (
    <PageShell
      title={`Paper ${paper.code} — ${kindLabel(question.kind)}`}
      breadcrumbs={[
        { label: "Answer Writing", href: "/answers" },
        { label: `Paper ${paper.code}`, href: `/answers/${paper.id}` },
        { label: kindLabel(question.kind) },
      ]}
      actions={<BookmarkButton type="question" id={question.id} labeled />}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="primary">{kindLabel(question.kind)}</Badge>
              <Badge variant="outline">{question.marks} marks</Badge>
              {question.wordTarget ? (
                <Badge variant="outline">~{question.wordTarget} words</Badge>
              ) : null}
            </div>
            <p className="font-medium leading-relaxed">{question.prompt}</p>
            {question.passage ? (
              <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed">
                {question.passage}
              </div>
            ) : null}
            {question.keywords.length ? (
              <div className="flex flex-wrap gap-1.5">
                {question.keywords.map((k) => (
                  <Badge key={k} variant="default">
                    {k}
                  </Badge>
                ))}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <AnswerEditor questionId={question.id} wordTarget={question.wordTarget} />

        {question.modelAnswer ? (
          <ModelAnswer
            text={question.modelAnswer}
            label={question.kind === "correspondence" ? "Template" : "Model answer"}
          />
        ) : null}
      </div>
    </PageShell>
  );
}
