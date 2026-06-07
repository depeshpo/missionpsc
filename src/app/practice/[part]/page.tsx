import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function PracticePartPage({
  params,
}: {
  params: Promise<{ part: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Practice by part"
      description="Quizzes for a part of Paper I."
      breadcrumbs={[{ label: "Practice", href: "/practice" }, { label: "Part" }]}
    />
  );
}
