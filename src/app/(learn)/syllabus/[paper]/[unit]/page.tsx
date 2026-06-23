import { notFound } from "next/navigation";
import { getUnit } from "@/data/syllabus";
import { UnitView } from "@/components/syllabus/UnitView";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const found = getUnit(unitId);
  if (!found || found.paper.id !== paperId) notFound();

  return (
    <UnitView
      paper={found.paper}
      sectionId={found.section.id}
      unitId={found.unit.id}
    />
  );
}
