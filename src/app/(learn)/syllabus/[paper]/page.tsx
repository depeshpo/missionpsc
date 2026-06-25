import { notFound } from "next/navigation";
import { getPaper } from "@/lib/db/syllabus";
import { PaperSyllabus } from "@/components/syllabus/PaperSyllabus";

export default async function SyllabusPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = await getPaper(paperId);
  if (!paper) notFound();
  return <PaperSyllabus paper={paper} />;
}
