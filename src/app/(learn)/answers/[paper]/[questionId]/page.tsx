import { AnswerDetail } from "@/components/answers/AnswerDetail";

export default async function AnswerQuestionPage({
  params,
}: {
  params: Promise<{ paper: string; questionId: string }>;
}) {
  const { paper: paperId, questionId } = await params;
  return <AnswerDetail paperId={paperId} questionId={questionId} />;
}
