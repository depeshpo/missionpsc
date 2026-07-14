import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import type { Note, Paper, Unit } from "@/lib/types";
import { MarkReadButton } from "@/components/notes/MarkReadButton";
import { NoteToc } from "@/components/notes/NoteToc";
import { NoteContent } from "@/components/notes/NoteContent";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

/** Public note reader. The page resolves the note and 404s when it's missing. */
export function NoteReader({
  paper,
  unit,
  note,
}: {
  paper: Paper;
  unit: Unit;
  note: Note;
}) {
  return (
    <article>
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: `Paper ${paper.code}`, href: `/notes/${paper.id}` },
          { label: unit.title },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
        <div className="flex items-center gap-2">
          <BookmarkButton type="note" id={unit.id} labeled />
          <MarkReadButton unitId={unit.id} />
        </div>
      </div>

      {note.sections.some((s) => s.heading.trim() !== "") ? (
        <Card className="mt-6">
          <CardContent>
            <NoteToc sections={note.sections} />
          </CardContent>
        </Card>
      ) : null}

      <div className="mt-6">
        <NoteContent sections={note.sections} />
      </div>
    </article>
  );
}
