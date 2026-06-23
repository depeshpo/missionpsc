import { AnswersPaper } from "@/components/answers/AnswersPaper";

export default async function AnswersPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <AnswersPaper paperId={paperId} />;
}
