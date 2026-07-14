import { notFound } from "next/navigation";
import { getPaper } from "@/lib/db/syllabus";
import { getNotes } from "@/lib/db/notes";
import { unitsWithNotes } from "@/lib/notes";
import { noteHeadings } from "@/data/notes";
import { NotesSidebar, type SidebarItem } from "@/components/notes/NotesSidebar";

export default async function NotesPaperLayout({
  children,
  params,
}: LayoutProps<"/notes/[paper]">) {
  const { paper: paperId } = await params;
  const [paper, notes] = await Promise.all([getPaper(paperId), getNotes()]);
  if (!paper) notFound();

  const items: SidebarItem[] = unitsWithNotes(notes, paper).map(({ unit, note }) => ({
    unitId: unit.id,
    href: `/notes/${paper.id}/${unit.id}`,
    number: unit.number,
    title: unit.title,
    headings: noteHeadings(note.sections),
  }));

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <NotesSidebar
          paperTitle={`Paper ${paper.code} — ${paper.title}`}
          paperHref={`/notes/${paper.id}`}
          items={items}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
