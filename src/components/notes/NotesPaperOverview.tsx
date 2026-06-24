"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { getPaper } from "@/data/syllabus";
import { useNotes, unitsWithNotesFrom } from "@/lib/hooks/useNotes";
import { NoteReadProgress } from "@/components/notes/NoteReadProgress";

/** Public per-paper notes overview, resolved through the override. */
export function NotesPaperOverview({ paperId }: { paperId: string }) {
  const list = useNotes();
  const paper = getPaper(paperId);
  const units = paper ? unitsWithNotesFrom(list, paper.id) : [];

  if (!paper) {
    return (
      <EmptyState
        title="Paper not found"
        description="This paper is not available."
      />
    );
  }

  return (
    <div>
      <Breadcrumbs items={[{ label: "Notes", href: "/notes" }, { label: paper.title }]} />
      <h1 className="mt-3 text-2xl font-semibold tracking-tight">
        Paper {paper.code} — {paper.title}
      </h1>
      <div className="mt-3 max-w-xs">
        <NoteReadProgress unitIds={units.map(({ unit }) => unit.id)} />
      </div>

      {units.length === 0 ? (
        <p className="mt-6 text-sm text-muted-foreground">No notes for this paper yet.</p>
      ) : (
        <div className="mt-6 space-y-2">
          {units.map(({ unit, note }) => (
            <Link key={unit.id} href={`/notes/${paper.id}/${unit.id}`} className="group block">
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
      )}
    </div>
  );
}
