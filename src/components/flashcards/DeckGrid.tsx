"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import type { Deck, Flashcard } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { DeckProgress } from "./DeckProgress";

/** Public deck grid (decks + cards from the DB, via the server page). */
export function DeckGrid({ decks, cards }: { decks: Deck[]; cards: Flashcard[] }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {decks.map((deck) => {
        const cardIds = cards.filter((c) => c.deckId === deck.id).map((c) => c.id);
        return (
          <Link key={deck.id} href={`/flashcards/${deck.id}`} className="group block">
            <Card className="h-full transition-colors group-hover:border-primary/40">
              <CardContent className="flex h-full flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                    <Layers className="h-4 w-4" />
                  </span>
                  <Badge variant="outline">{deck.cardCount} cards</Badge>
                </div>
                <div className="flex-1">
                  <p className="font-semibold leading-tight">{deck.title}</p>
                  {deck.description ? (
                    <p className="mt-1 text-sm text-muted-foreground">{deck.description}</p>
                  ) : null}
                </div>
                <DeckProgress cardIds={cardIds} />
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Study deck
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        );
      })}
    </div>
  );
}
