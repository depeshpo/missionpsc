import { notFound } from "next/navigation";
import { NotesPaperOverview } from "@/components/notes/NotesPaperOverview";
import { getNotes } from "@/lib/db/notes";
import { getPaper } from "@/lib/db/syllabus";

export default async function NotesPaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const [paper, notes] = await Promise.all([getPaper(paperId), getNotes()]);
  if (!paper) notFound();

  return <NotesPaperOverview paper={paper} notes={notes} />;
}
