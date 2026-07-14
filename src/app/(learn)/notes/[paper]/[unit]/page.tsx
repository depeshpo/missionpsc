import { notFound } from "next/navigation";
import { NoteReader } from "@/components/notes/NoteReader";
import { getNoteByUnit } from "@/lib/db/notes";
import { getPaper } from "@/lib/db/syllabus";

export default async function NoteReaderPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const [paper, note] = await Promise.all([getPaper(paperId), getNoteByUnit(unitId)]);
  if (!paper || !note) notFound();

  // The unit has to actually belong to this paper, or the URL is bogus.
  const unit = paper.sections.flatMap((s) => s.units).find((u) => u.id === unitId);
  if (!unit) notFound();

  return <NoteReader paper={paper} unit={unit} note={note} />;
}
