import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function SyllabusPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Paper detail"
      description="Sections and units for a single paper."
      breadcrumbs={[{ label: "Syllabus", href: "/syllabus" }, { label: "Paper" }]}
    />
  );
}
