import { notFound } from "next/navigation";
import { getPaper } from "@/data/syllabus";
import { NotesSidebarLive } from "@/components/notes/NotesSidebarLive";

export default async function NotesPaperLayout({
  children,
  params,
}: LayoutProps<"/notes/[paper]">) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  return (
    <div className="mx-auto w-full max-w-6xl px-6 py-6">
      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <NotesSidebarLive
          paperId={paper.id}
          paperTitle={`Paper ${paper.code} — ${paper.title}`}
          paperHref={`/notes/${paper.id}`}
        />
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
