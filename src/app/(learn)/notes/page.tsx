import { PageShell } from "@/components/layout/PageShell";
import { NotesIndex } from "@/components/notes/NotesIndex";

export default function NotesPage() {
  return (
    <PageShell
      title="Notes"
      description="Study material organized by syllabus unit. Pick a paper to read its notes."
    >
      <NotesIndex />
    </PageShell>
  );
}
