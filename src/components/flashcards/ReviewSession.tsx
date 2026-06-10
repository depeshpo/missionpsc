"use client";

import { useState } from "react";
import { Check, RotateCw, X, Trophy } from "lucide-react";
import type { Flashcard } from "@/lib/types";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { FLASHCARDS_KNOWN_KEY } from "./progress";
import { FlipCard } from "./FlipCard";
import { BookmarkButton } from "@/components/bookmarks/BookmarkButton";

/**
 * Flip-through study session over a deck's cards. "Know" persists the card in
 * the shared known set; "Again" advances without marking. Finishing shows a
 * recap with Restart and Reset-deck (scoped to this deck's cards).
 */
export function ReviewSession({ cards }: { cards: Flashcard[] }) {
  const { has, toggle } = useLocalIdSet(FLASHCARDS_KNOWN_KEY);
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);

  const total = cards.length;
  const done = index >= total;

  function markKnown(card: Flashcard) {
    if (!has(card.id)) toggle(card.id); // add to known set
  }

  function advance() {
    setFlipped(false);
    setIndex((i) => i + 1);
  }

  function restart() {
    setFlipped(false);
    setIndex(0);
  }

  function resetDeck() {
    // Clear known only for this deck's cards (the set is global across decks).
    for (const c of cards) if (has(c.id)) toggle(c.id);
    restart();
  }

  if (done) {
    const knownNow = cards.reduce((n, c) => (has(c.id) ? n + 1 : n), 0);
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-accent text-accent-foreground">
            <Trophy className="h-6 w-6" />
          </span>
          <div>
            <p className="text-lg font-semibold">Deck complete</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {knownNow} / {total} cards marked known.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Button onClick={restart}>
              <RotateCw className="h-4 w-4" />
              Restart
            </Button>
            <Button variant="outline" onClick={resetDeck}>
              Reset deck
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const card = cards[index];

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="tabular-nums">
            Card {index + 1} of {total}
          </span>
          <BookmarkButton type="flashcard" id={card.id} />
        </div>
        <ProgressBar value={index} max={total} />
      </div>

      <FlipCard card={card} flipped={flipped} onFlip={() => setFlipped((f) => !f)} />

      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" onClick={advance}>
          <X className="h-4 w-4" />
          Again
        </Button>
        <Button
          onClick={() => {
            markKnown(card);
            advance();
          }}
        >
          <Check className="h-4 w-4" />
          Know
        </Button>
      </div>
    </div>
  );
}
