import { notFound } from "next/navigation";
import { getPaper } from "@/data/syllabus";
import { unitsWithNotes, noteHeadings } from "@/data/notes";
import { NotesSidebar, type SidebarItem } from "@/components/notes/NotesSidebar";

export default async function NotesPaperLayout({
  children,
  params,
}: LayoutProps<"/notes/[paper]">) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  const items: SidebarItem[] = unitsWithNotes(paper.id).map(({ unit, note }) => ({
    unitId: unit.id,
    href: `/notes/${paper.id}/${unit.id}`,
    number: unit.number,
    title: unit.title,
    headings: noteHeadings(note.body),
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
