"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getUnit } from "@/data/syllabus";
import { useNotes, getNoteByUnitFrom } from "@/lib/hooks/useNotes";
import { MarkReadButton } from "@/components/notes/MarkReadButton";
import { NoteToc } from "@/components/notes/NoteToc";
import { NoteContent } from "@/components/notes/NoteContent";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

/** Public note reader, resolved through the override (admin-edited notes show here). */
export function NoteReader({ paperId, unitId }: { paperId: string; unitId: string }) {
  const list = useNotes();
  const found = getUnit(unitId);
  const note = getNoteByUnitFrom(list, unitId);

  if (!found || !note || found.paper.id !== paperId) {
    return (
      <div>
        <Breadcrumbs
          items={[
            { label: "Notes", href: "/notes" },
            ...(found ? [{ label: `Paper ${found.paper.code}`, href: `/notes/${found.paper.id}` }] : []),
          ]}
        />
        <EmptyState
          className="mt-6"
          icon={FileText}
          title="This note is no longer available"
          description="It may have been removed. Browse the available notes."
          action={
            <Link
              href={found ? `/notes/${found.paper.id}` : "/notes"}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to notes
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </div>
    );
  }

  const { paper, unit } = found;

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
