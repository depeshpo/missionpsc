"use client";

import { RotateCcw } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { cn } from "@/lib/cn";
import { Badge } from "@/components/ui/Badge";

/**
 * Presentational flip card. Shows the front; clicking reveals the back. Flip
 * state is controlled by the parent review session.
 */
export function FlipCard({
  card,
  flipped,
  onFlip,
}: {
  card: Flashcard;
  flipped: boolean;
  onFlip: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onFlip}
      aria-label={flipped ? "Show front" : "Show back"}
      className="group flex min-h-64 w-full flex-col rounded-xl border border-border bg-card p-6 text-left shadow-sm transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="flex items-center justify-between">
        <Badge variant={flipped ? "success" : "outline"}>
          {flipped ? "Back" : "Front"}
        </Badge>
        <RotateCcw className="h-4 w-4 text-muted-foreground" />
      </div>
      <div className="flex flex-1 items-center justify-center py-6">
        <p
          className={cn(
            "text-center leading-relaxed",
            flipped ? "text-base text-foreground" : "text-xl font-semibold",
          )}
        >
          {flipped ? card.back : card.front}
        </p>
      </div>
      <div className="flex min-h-6 flex-wrap items-center justify-center gap-1.5">
        {flipped && card.tags.length
          ? card.tags.map((t) => (
              <Badge key={t} variant="default">
                {t}
              </Badge>
            ))
          : null}
      </div>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {flipped ? "Click to flip back" : "Click to reveal"}
      </p>
    </button>
  );
}
