"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, PenSquare } from "lucide-react";
import type { Paper, SubjectiveQuestion } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { kindLabel } from "@/data/subjective";
import { deleteQuestion } from "@/app/(dashboard)/admin/questions/actions";

/** Admin manage view for the question bank (from the DB): edit/delete questions. */
export function QuestionsAdminList({
  papers,
  list,
}: {
  papers: Paper[];
  list: SubjectiveQuestion[];
}) {
  const router = useRouter();

  if (list.length === 0) {
    return (
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
    );
  }

  // Group by paper in syllabus order (skip papers with no questions).
  const groups = papers
    .map((p) => ({ paper: p, items: list.filter((q) => q.paperId === p.id) }))
    .filter((g) => g.items.length > 0);

  async function handleDelete(q: SubjectiveQuestion) {
    const label = q.prompt.length > 60 ? `${q.prompt.slice(0, 60)}…` : q.prompt;
    if (!window.confirm(`Delete this question?\n\n“${label}”`)) return;
    await deleteQuestion(q.id, q.paperId);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {list.length} question{list.length === 1 ? "" : "s"}
      </p>

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
                      onClick={() => handleDelete(q)}
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
