"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { useBookmarks } from "@/lib/hooks/useBookmarks";
import { allUnits } from "@/data/syllabus";
import { subjectiveQuestions } from "@/data/subjective";
import { flashcards } from "@/data/flashcards";
import { notes } from "@/data/notes";
import { SYLLABUS_PROGRESS_KEY } from "@/components/syllabus/progress";
import { ANSWERS_ATTEMPTED_KEY } from "@/components/answers/progress";
import { FLASHCARDS_KNOWN_KEY } from "@/components/flashcards/progress";
import { NOTES_READ_KEY } from "@/components/notes/progress";

function Stat({
  label,
  href,
  done,
  total,
}: {
  label: string;
  href: string;
  done: number;
  total: number;
}) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <Link href={href} className="group block">
      <Card className="h-full transition-colors group-hover:border-primary/40">
        <CardContent className="space-y-2">
          <div className="flex items-baseline justify-between">
            <span className="text-sm font-medium">{label}</span>
            <span className="text-xs text-muted-foreground tabular-nums">{pct}%</span>
          </div>
          <ProgressBar value={done} max={total} />
          <p className="text-xs text-muted-foreground tabular-nums">
            {done} / {total}
          </p>
        </CardContent>
      </Card>
    </Link>
  );
}

export function DashboardProgress() {
  const syllabus = useLocalIdSet(SYLLABUS_PROGRESS_KEY);
  const answers = useLocalIdSet(ANSWERS_ATTEMPTED_KEY);
  const cards = useLocalIdSet(FLASHCARDS_KNOWN_KEY);
  const notesRead = useLocalIdSet(NOTES_READ_KEY);
  const { bookmarks } = useBookmarks();

  const stats = [
    { label: "Syllabus covered", href: "/syllabus", done: allUnits.filter((u) => syllabus.has(u.id)).length, total: allUnits.length },
    { label: "Answers attempted", href: "/answers", done: subjectiveQuestions.filter((q) => answers.has(q.id)).length, total: subjectiveQuestions.length },
    { label: "Flashcards known", href: "/flashcards", done: flashcards.filter((c) => cards.has(c.id)).length, total: flashcards.length },
    { label: "Notes read", href: "/notes", done: notes.filter((n) => notesRead.has(n.unitId)).length, total: notes.length },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((s) => (
        <Stat key={s.label} {...s} />
      ))}
      <Link href="/bookmarks" className="group block">
        <Card className="h-full transition-colors group-hover:border-primary/40">
          <CardContent className="flex h-full items-center gap-4">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
              <Bookmark className="h-5 w-5" />
            </span>
            <div>
              <p className="text-2xl font-semibold tabular-nums">{bookmarks.length}</p>
              <p className="text-sm text-muted-foreground">Bookmarks</p>
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
