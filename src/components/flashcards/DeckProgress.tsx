"use client";

import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { FLASHCARDS_KNOWN_KEY } from "./progress";

/**
 * "known / total" count + bar over a deck's card ids. Reads the shared known
 * set, so it updates live as cards are marked. Mirrors syllabus `Coverage`.
 */
export function DeckProgress({
  cardIds,
  className,
  showBar = true,
}: {
  cardIds: string[];
  className?: string;
  showBar?: boolean;
}) {
  const { has } = useUserIdSet(FLASHCARDS_KNOWN_KEY);
  const total = cardIds.length;
  const known = cardIds.reduce((n, id) => (has(id) ? n + 1 : n), 0);

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {known} / {total} known
        </span>
        <span className="tabular-nums">
          {total > 0 ? Math.round((known / total) * 100) : 0}%
        </span>
      </div>
      {showBar ? <ProgressBar value={known} max={total} /> : null}
    </div>
  );
}
