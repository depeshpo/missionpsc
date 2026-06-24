import { NoteReader } from "@/components/notes/NoteReader";

export default async function NoteReaderPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  return <NoteReader paperId={paperId} unitId={unitId} />;
}
