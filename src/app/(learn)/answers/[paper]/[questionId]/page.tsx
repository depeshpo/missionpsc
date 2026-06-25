import { notFound } from "next/navigation";
import { AnswerDetail } from "@/components/answers/AnswerDetail";
import { getPaper } from "@/lib/db/syllabus";
import { getQuestion } from "@/lib/db/subjective";

export default async function AnswerQuestionPage({
  params,
}: {
  params: Promise<{ paper: string; questionId: string }>;
}) {
  const { paper: paperId, questionId } = await params;
  const question = await getQuestion(questionId);
  if (!question || question.paperId !== paperId) notFound();
  const paper = await getPaper(question.paperId);
  if (!paper) notFound();
  return <AnswerDetail question={question} paper={paper} />;
}
