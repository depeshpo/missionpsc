import { notFound } from "next/navigation";
import { AnswersPaper } from "@/components/answers/AnswersPaper";
import { getPaper } from "@/lib/db/syllabus";
import { getQuestions } from "@/lib/db/subjective";

export default async function AnswersPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const [paper, list] = await Promise.all([getPaper(paperId), getQuestions()]);
  if (!paper) notFound();
  return <AnswersPaper paper={paper} list={list} />;
}
