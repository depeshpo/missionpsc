"use client";

import Link from "next/link";
import { Pencil, Trash2, RotateCcw, FileText } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Skeleton } from "@/components/ui/Skeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { useMounted } from "@/lib/hooks/useMounted";
import { useNotesAdmin, notesByPaperFrom } from "@/lib/hooks/useNotes";
import { papers, getUnit } from "@/data/syllabus";

/** Admin manage view for the notes collection: edit/delete notes + reset. */
export function NotesAdminList() {
  const mounted = useMounted();
  const { list, remove, reset, isOverridden } = useNotesAdmin();

  if (!mounted) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
        <Skeleton className="h-20" />
      </div>
    );
  }

  if (list.length === 0) {
    return (
      <div className="space-y-4">
        {isOverridden ? <ResetButton onReset={reset} /> : null}
        <EmptyState
          icon={FileText}
          title="No notes yet"
          description="Add your first note to show it on the public Notes pages."
          action={
            <Link href="/admin/notes/new" className="text-sm font-medium text-primary">
              New note
            </Link>
          }
        />
      </div>
    );
  }

  const groups = papers
    .map((p) => ({ paper: p, items: notesByPaperFrom(list, p.id) }))
    .filter((g) => g.items.length > 0);

  function handleDelete(title: string, id: string) {
    if (window.confirm(`Delete the note “${title}”? This removes it from the public page.`)) {
      remove(id);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {list.length} note{list.length === 1 ? "" : "s"}
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
            {group.items.map((note) => {
              const unit = getUnit(note.unitId)?.unit;
              return (
                <Card key={note.id}>
                  <CardContent className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium leading-tight">{note.title}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {unit
                          ? `${unit.number !== "—" ? `${unit.number}. ` : ""}${unit.title}`
                          : note.unitId}{" "}
                        · {note.sections.length} subtitle{note.sections.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Link
                        href={`/admin/notes/${note.id}/edit`}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                        aria-label={`Edit ${note.title}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(note.title, note.id)}
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
                        aria-label={`Delete ${note.title}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
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
        if (window.confirm("Reset all notes to the defaults? Your changes will be lost.")) {
          onReset();
        }
      }}
    >
      <RotateCcw className="h-4 w-4" />
      Reset to default
    </Button>
  );
}
