import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Unit detail"
      description="Subtopics, linked notes, and practice for a single unit."
      breadcrumbs={[
        { label: "Syllabus", href: "/syllabus" },
        { label: "Paper", href: "/syllabus" },
        { label: "Unit" },
      ]}
    />
  );
}
