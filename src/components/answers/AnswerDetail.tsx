"use client";

import type { Paper, SubjectiveQuestion } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { kindLabel } from "@/data/subjective";
import { AnswerEditor } from "@/components/answers/AnswerEditor";
import { ModelAnswer } from "@/components/answers/ModelAnswer";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

/**
 * Public question detail (question + paper from the DB; the server page 404s a
 * missing/mismatched id). Client component for the answer editor + bookmark.
 */
export function AnswerDetail({
  question,
  paper,
}: {
  question: SubjectiveQuestion;
  paper: Paper;
}) {
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
