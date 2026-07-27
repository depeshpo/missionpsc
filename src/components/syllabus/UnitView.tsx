"use client";

import Link from "next/link";
import { BookOpen, Layers, PenLine, ArrowRight, FileX } from "lucide-react";
import type { Paper } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { UnitCheckbox } from "./UnitCheckbox";

/**
 * Reader for a single unit (paper content from the DB, passed by the server
 * page). Finds the section/unit by id; a unit that no longer exists in the
 * paper shows an empty state. Stays a client component for the completion
 * checkbox (localStorage progress).
 */
export function UnitView({
  paper,
  unitId,
  hasNote,
}: {
  paper: Paper;
  unitId: string;
  hasNote: boolean;
}) {
  const section = paper.sections.find((s) => s.units.some((u) => u.id === unitId));
  const unit = section?.units.find((u) => u.id === unitId);

  if (!section || !unit) {
    return (
      <PageShell
        title="Unit not found"
        breadcrumbs={[
          { label: "Syllabus", href: "/syllabus" },
          { label: `Paper ${paper.code}`, href: `/syllabus/${paper.id}` },
        ]}
      >
        <EmptyState
          icon={FileX}
          title="This unit was removed from the syllabus"
          description="It’s no longer part of this paper. Head back to see the current units."
          action={
            <Link
              href={`/syllabus/${paper.id}`}
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Paper {paper.code}
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageShell>
    );
  }

  const studyLinks = [
    {
      href: `/notes/${paper.id}/${unit.id}`,
      label: "Read notes",
      icon: BookOpen,
      // Only linkable when a note was authored for this unit; otherwise it 404s.
      available: hasNote,
      unavailableLabel: "No notes yet",
    },
    { href: `/answers/${paper.id}`, label: "Practice answers", icon: PenLine, available: true },
    { href: "/flashcards", label: "Flashcards", icon: Layers, available: true },
  ];

  return (
    <PageShell
      title={`${unit.number !== "—" ? `Unit ${unit.number} — ` : ""}${unit.title}`}
      description={section.label}
      breadcrumbs={[
        { label: "Syllabus", href: "/syllabus" },
        { label: `Paper ${paper.code}`, href: `/syllabus/${paper.id}` },
        { label: unit.title },
      ]}
      actions={<UnitCheckbox unitId={unit.id} label="Mark complete" />}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3">
            <Badge variant="outline">{section.marks} marks · {section.label.split(" — ")[0]}</Badge>
            <ul className="space-y-2">
              {unit.subtopics.map((sub, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Study this unit
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {studyLinks.map((s) => {
              const Icon = s.icon;

              // Unavailable (e.g. no note for this unit yet): a muted, non-clickable
              // card instead of a link that would 404.
              if (!s.available) {
                return (
                  <Card key={s.label} className="opacity-60">
                    <CardContent className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-muted text-muted-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium text-muted-foreground">
                        {s.unavailableLabel ?? s.label}
                      </span>
                    </CardContent>
                  </Card>
                );
              }

              return (
                <Link key={s.label} href={s.href}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium">{s.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
