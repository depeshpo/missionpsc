"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Pencil, Trash2, FileText } from "lucide-react";
import type { Note, Paper } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { findUnit, notesByPaper } from "@/lib/notes";
import { deleteNote } from "@/app/(dashboard)/admin/notes/actions";
import { toast } from "@/lib/toast";

/** Admin manage view for the notes collection (from the DB): edit/delete notes. */
export function NotesAdminList({ notes, papers }: { notes: Note[]; papers: Paper[] }) {
  const router = useRouter();

  if (notes.length === 0) {
    return (
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
    );
  }

  const groups = papers
    .map((p) => ({ paper: p, items: notesByPaper(notes, papers, p.id) }))
    .filter((g) => g.items.length > 0);

  async function handleDelete(id: string, title: string) {
    if (!window.confirm(`Delete the note “${title}”? This removes it from the public page.`)) return;
    const res = await deleteNote(id);
    if ("error" in res) {
      toast.error(res.error);
      return;
    }
    toast.success("Note deleted");
    router.refresh();
  }

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        {notes.length} note{notes.length === 1 ? "" : "s"}
      </p>

      {groups.map((group) => (
        <section key={group.paper.id} className="space-y-2">
          <h2 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Paper {group.paper.code} — {group.paper.title}
          </h2>
          <div className="space-y-2">
            {group.items.map((note) => {
              const unit = findUnit(papers, note.unitId)?.unit;
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
                        onClick={() => handleDelete(note.id, note.title)}
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
