import { getPaper } from "@/lib/db/syllabus";
import { PaperSyllabus } from "@/components/syllabus/PaperSyllabus";

export default async function SyllabusPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <PaperSyllabus paperId={paperId} seed={await getPaper(paperId)} />;
}
