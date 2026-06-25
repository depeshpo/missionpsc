import { notFound } from "next/navigation";
import { getPaper } from "@/lib/db/syllabus";
import { UnitView } from "@/components/syllabus/UnitView";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const paper = await getPaper(paperId);
  if (!paper) notFound();
  return <UnitView paper={paper} unitId={unitId} />;
}
