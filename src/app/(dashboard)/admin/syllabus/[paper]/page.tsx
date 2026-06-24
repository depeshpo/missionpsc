import { PaperOverviewScreen } from "@/components/admin/PaperOverviewScreen";
import { getPaper } from "@/data/syllabus";

export default async function PaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <PaperOverviewScreen paperId={paperId} seed={getPaper(paperId)} />;
}
