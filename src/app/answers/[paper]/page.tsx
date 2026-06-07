import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function AnswersPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Paper questions"
      description="Subjective questions for a paper, by section."
      breadcrumbs={[{ label: "Answer Writing", href: "/answers" }, { label: "Paper" }]}
    />
  );
}
