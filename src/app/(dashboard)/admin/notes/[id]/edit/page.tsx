import { NoteEditor } from "@/components/admin/NoteEditor";
import { getNotes } from "@/lib/db/notes";
import { getPapers } from "@/lib/db/syllabus";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [notes, papers] = await Promise.all([getNotes(), getPapers()]);
  return <NoteEditor id={id} notes={notes} papers={papers} />;
}
