"use client";

import Link from "next/link";
import { Pencil, Trash2, RotateCcw, PenSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import {
  useSubjectiveQuestionsAdmin,
  questionsByPaperFrom,
} from "@/lib/hooks/useSubjectiveQuestions";
import { kindLabel } from "@/data/subjective";
import { papers } from "@/data/syllabus";

/** Admin manage view for the question bank: edit/delete questions + reset. */
export function QuestionsAdminList() {
  const mounted = useMounted();
  const { list, remove, reset, isOverridden } = useSubjectiveQuestionsAdmin();

  if (!mounted) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        {isOverridden ? <ResetButton onReset={reset} /> : null}
        <EmptyState
          icon={PenSquare}
          title="No questions yet"
          description="Add your first question to show it on the public Answer Writing pages."
          action={
            <Link href="/admin/questions/new" className="text-sm font-medium text-primary">
              New question
            </Link>
          }
        />
      </div>
    );
  }

  // Group by paper in syllabus order (skip papers with no questions).
  const groups = papers
    .map((p) => ({ paper: p, items: questionsByPaperFrom(list, p.id) }))
    .filter((g) => g.items.length > 0);

  function handleDelete(promptText: string, id: string) {
    const label = promptText.length > 60 ? `${promptText.slice(0, 60)}…` : promptText;
    if (window.confirm(`Delete this question?\n\n“${label}”`)) remove(id);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {list.length} question{list.length === 1 ? "" : "s"}
          {isOverridden ? (
            <Badge variant="warning" className="ml-2">Customised</Badge>
          ) : null}
        </p>
        {isOverridden ? <ResetButton onReset={reset} /> : null}
      </div>

      {groups.map((group) => (
        <section key={group.paper.id} className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Paper {group.paper.code} — {group.paper.title}
          </h2>
          <div className="space-y-2">
            {group.items.map((q) => (
              <Card key={q.id}>
                <CardContent className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-1 flex items-center gap-2">
                      <Badge variant="default">{kindLabel(q.kind)}</Badge>
                      <span className="text-xs text-muted-foreground tabular-nums">
                        {q.marks} marks
                      </span>
                    </div>
                    <p className="line-clamp-2 text-sm">{q.prompt}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/admin/questions/${q.id}/edit`}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                      aria-label="Edit question"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.prompt, q.id)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                      aria-label="Delete question"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => {
        if (window.confirm("Reset all questions to the defaults? Your changes will be lost.")) {
          onReset();
        }
      }}
    >
      <RotateCcw className="h-4 w-4" />
      Reset to default
    </Button>
  );
}
