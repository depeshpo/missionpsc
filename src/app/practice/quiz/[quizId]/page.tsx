import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function QuizPlayerPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Quiz"
      description="Question-by-question quiz player."
      breadcrumbs={[{ label: "Practice", href: "/practice" }, { label: "Quiz" }]}
    />
  );
}
