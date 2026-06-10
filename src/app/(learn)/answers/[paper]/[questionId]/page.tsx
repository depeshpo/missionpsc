import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function AnswerQuestionPage({
  params,
}: {
  params: Promise<{ paper: string; questionId: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Question"
      description="Prompt, model answer, and your own answer notes."
      breadcrumbs={[
        { label: "Answer Writing", href: "/answers" },
        { label: "Paper", href: "/answers" },
        { label: "Question" },
      ]}
    />
  );
}
