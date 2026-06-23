import { notFound } from "next/navigation";
import { getPaper } from "@/data/syllabus";
import { PaperSyllabus } from "@/components/syllabus/PaperSyllabus";

export default async function SyllabusPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  return <PaperSyllabus paper={paper} />;
}
