import { getPaper } from "@/data/syllabus";
import { UnitView } from "@/components/syllabus/UnitView";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  return <UnitView paperId={paperId} unitId={unitId} seed={getPaper(paperId)} />;
}
