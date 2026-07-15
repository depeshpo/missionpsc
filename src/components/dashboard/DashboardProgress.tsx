"use client";

import Link from "next/link";
import { Bookmark } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { useUserBookmarks } from "@/lib/hooks/useUserBookmarks";
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

/**
 * Progress widgets. The content ids come from the DB via the page; what the user
 * has *done* still lives in localStorage (that moves server-side in B2).
 */
export function DashboardProgress({
  unitIds,
  questionIds,
  cardIds,
  noteUnitIds,
}: {
  unitIds: string[];
  questionIds: string[];
  cardIds: string[];
  noteUnitIds: string[];
}) {
  const syllabus = useUserIdSet(SYLLABUS_PROGRESS_KEY);
  const answers = useUserIdSet(ANSWERS_ATTEMPTED_KEY);
  const cards = useUserIdSet(FLASHCARDS_KNOWN_KEY);
  const notesRead = useUserIdSet(NOTES_READ_KEY);
  const { bookmarks } = useUserBookmarks();

  const done = (ids: string[], set: { has: (id: string) => boolean }) =>
    ids.filter((id) => set.has(id)).length;

  const stats = [
    { label: "Syllabus covered", href: "/syllabus", done: done(unitIds, syllabus), total: unitIds.length },
    { label: "Answers attempted", href: "/answers", done: done(questionIds, answers), total: questionIds.length },
    { label: "Flashcards known", href: "/flashcards", done: done(cardIds, cards), total: cardIds.length },
    { label: "Notes read", href: "/notes", done: done(noteUnitIds, notesRead), total: noteUnitIds.length },
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
