import { notFound } from "next/navigation";
import { getPaper } from "@/lib/db/syllabus";
import { getNoteByUnit } from "@/lib/db/notes";
import { UnitView } from "@/components/syllabus/UnitView";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const [paper, note] = await Promise.all([getPaper(paperId), getNoteByUnit(unitId)]);
  if (!paper) notFound();
  // A unit only has notes if one was authored for it — otherwise the "Read notes"
  // link would 404. Pass availability so UnitView can disable it.
  return <UnitView paper={paper} unitId={unitId} hasNote={note !== null} />;
}
