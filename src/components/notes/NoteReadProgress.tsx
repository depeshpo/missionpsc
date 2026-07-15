"use client";

import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { NOTES_READ_KEY } from "./progress";

/**
 * "read / total" count + bar over a set of unit ids. Reads the shared read set
 * so it updates live. Mirrors syllabus `Coverage` / flashcards `DeckProgress`.
 */
export function NoteReadProgress({
  unitIds,
  className,
  showBar = true,
}: {
  unitIds: string[];
  className?: string;
  showBar?: boolean;
}) {
  const { has } = useUserIdSet(NOTES_READ_KEY);
  const total = unitIds.length;
  const read = unitIds.reduce((n, id) => (has(id) ? n + 1 : n), 0);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {read} / {total} read
        </span>
        <span className="tabular-nums">
          {total > 0 ? Math.round((read / total) * 100) : 0}%
        </span>
      </div>
      {showBar ? <ProgressBar value={read} max={total} /> : null}
    </div>
  );
}
