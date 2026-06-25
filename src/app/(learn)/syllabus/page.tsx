import { PageShell } from "@/components/layout/PageShell";
import { STAGES } from "@/data/syllabus";
import { getPapers } from "@/lib/db/syllabus";
import { SyllabusMap } from "@/components/syllabus/SyllabusMap";

export default async function SyllabusPage() {
  const papers = await getPapers();
  return (
    <PageShell
      title="Syllabus Map"
      description="The full Stage → Paper → Section → Unit map with marks weights. Tick units as you cover them to track progress."
    >
      <SyllabusMap stages={STAGES} papers={papers} />
    </PageShell>
  );
}
