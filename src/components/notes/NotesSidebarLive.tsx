"use client";

import { useNotes, unitsWithNotesFrom } from "@/lib/hooks/useNotes";
import { noteHeadings } from "@/data/notes";
import { NotesSidebar, type SidebarItem } from "./NotesSidebar";

/**
 * Override-aware wrapper for NotesSidebar: builds the topic/heading tree from the
 * effective notes list so admin edits (added/removed notes, changed headings)
 * show in the left rail.
 */
export function NotesSidebarLive({
  paperId,
  paperTitle,
  paperHref,
}: {
  paperId: string;
  paperTitle: string;
  paperHref: string;
}) {
  const list = useNotes();
  const items: SidebarItem[] = unitsWithNotesFrom(list, paperId).map(({ unit, note }) => ({
    unitId: unit.id,
    href: `/notes/${paperId}/${unit.id}`,
    number: unit.number,
    title: unit.title,
    headings: noteHeadings(note.sections),
  }));

  return <NotesSidebar paperTitle={paperTitle} paperHref={paperHref} items={items} />;
}
