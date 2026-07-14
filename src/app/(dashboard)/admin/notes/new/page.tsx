import { NoteEditor } from "@/components/admin/NoteEditor";
import { getNotes } from "@/lib/db/notes";
import { getPapers } from "@/lib/db/syllabus";

export default async function NewNotePage() {
  const [notes, papers] = await Promise.all([getNotes(), getPapers()]);
  return <NoteEditor notes={notes} papers={papers} />;
}
