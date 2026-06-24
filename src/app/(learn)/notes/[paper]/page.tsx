import { NotesPaperOverview } from "@/components/notes/NotesPaperOverview";

export default async function NotesPaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  return <NotesPaperOverview paperId={paperId} />;
}
