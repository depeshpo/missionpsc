import { PaperOverviewScreen } from "@/components/admin/PaperOverviewScreen";
import { getPaper } from "@/lib/db/syllabus";

export default async function PaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <PaperOverviewScreen paperId={paperId} seed={await getPaper(paperId)} />;
}
