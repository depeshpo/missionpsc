import { PageShell } from "@/components/layout/PageShell";
import { STAGES, papers } from "@/data/syllabus";
import { SyllabusMap } from "@/components/syllabus/SyllabusMap";

export default function SyllabusPage() {
  return (
    <PageShell
      title="Syllabus Map"
      description="The full Stage → Paper → Section → Unit map with marks weights. Tick units as you cover them to track progress."
    >
      <SyllabusMap stages={STAGES} papers={papers} />
    </PageShell>
  );
}
