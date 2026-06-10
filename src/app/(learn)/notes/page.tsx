import Link from "next/link";
import { ArrowRight, BookOpen } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { papersWithNotes, notesByPaper } from "@/data/notes";
import { NoteReadProgress } from "@/components/notes/NoteReadProgress";

export default function NotesPage() {
  const papers = papersWithNotes();

  return (
    <PageShell
      title="Notes"
      description="Study material organized by syllabus unit. Pick a paper to read its notes."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => {
          const paperNotes = notesByPaper(paper.id);
          return (
            <Link key={paper.id} href={`/notes/${paper.id}`} className="group block">
              <Card className="h-full transition-colors group-hover:border-primary/40">
                <CardContent className="flex h-full flex-col gap-3">
                  <div className="flex items-start justify-between gap-2">
                    <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <Badge variant="outline">{paperNotes.length} note{paperNotes.length > 1 ? "s" : ""}</Badge>
                  </div>
                  <p className="flex-1 font-semibold leading-tight">
                    Paper {paper.code} — {paper.title}
                  </p>
                  <NoteReadProgress unitIds={paperNotes.map((n) => n.unitId)} />
                  <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Read notes
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </PageShell>
  );
}
