import { PaperEditScreen } from "@/components/admin/PaperEditScreen";
import { getPaper } from "@/lib/db/syllabus";

export default async function EditPaperPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <PaperEditScreen paperId={paperId} seed={await getPaper(paperId)} />;
}
