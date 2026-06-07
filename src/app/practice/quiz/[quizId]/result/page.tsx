import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function QuizResultPage({
  params,
}: {
  params: Promise<{ quizId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Quiz result"
      description="Score and answer review."
      breadcrumbs={[{ label: "Practice", href: "/practice" }, { label: "Result" }]}
    />
  );
}
