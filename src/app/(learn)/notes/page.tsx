import { PageShell } from "@/components/layout/PageShell";
import { NotesIndex } from "@/components/notes/NotesIndex";
import { getNotes } from "@/lib/db/notes";
import { getPapers } from "@/lib/db/syllabus";

export default async function NotesPage() {
  const [notes, papers] = await Promise.all([getNotes(), getPapers()]);

  return (
    <PageShell
      title="Notes"
      description="Study material organized by syllabus unit. Pick a paper to read its notes."
    >
      <NotesIndex notes={notes} papers={papers} />
    </PageShell>
  );
}
