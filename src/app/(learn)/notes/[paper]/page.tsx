import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import { getPaper } from "@/data/syllabus";
import { unitsWithNotes } from "@/data/notes";
import { NoteReadProgress } from "@/components/notes/NoteReadProgress";

export default async function NotesPaperOverviewPage({
  params,
}: {
  params: Promise<{ paper: string }>;
}) {
  const { paper: paperId } = await params;
  const paper = getPaper(paperId);
  if (!paper) notFound();

  const units = unitsWithNotes(paper.id);

  return (
    <div>
      <Breadcrumbs items={[{ label: "Notes", href: "/notes" }, { label: paper.title }]} />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Paper {paper.code} — {paper.title}
      </h1>
      <div className="mt-3 max-w-xs">
        <NoteReadProgress unitIds={units.map(({ unit }) => unit.id)} />
      </div>

      <div className="mt-6 space-y-2">
        {units.map(({ unit, note }) => (
          <Link
            key={unit.id}
            href={`/notes/${paper.id}/${unit.id}`}
            className="group block"
          >
            <Card className="transition-colors group-hover:border-primary/40">
              <CardContent className="flex items-center justify-between gap-3 py-4">
                <span className="min-w-0">
                  <span className="font-medium">
                    {unit.number !== "—" ? `${unit.number}. ` : ""}
                    {note.title}
                  </span>
                </span>
                <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
