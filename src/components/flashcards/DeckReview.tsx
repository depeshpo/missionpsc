"use client";

import { Layers } from "lucide-react";
import type { Deck, Flashcard } from "@/lib/types";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { ReviewSession } from "./ReviewSession";

/**
 * Public review page for a deck (deck + its cards from the DB, via the server
 * page, which 404s a missing deck). Stays a client component for the review
 * session (localStorage known-cards progress).
 */
export function DeckReview({ deck, cards }: { deck: Deck; cards: Flashcard[] }) {
  const deckCards = cards;

  return (
    <PageShell
      title={deck.title}
      description={deck.description}
      breadcrumbs={[{ label: "Flashcards", href: "/flashcards" }, { label: deck.title }]}
    >
      <div className="mx-auto max-w-xl">
        {deckCards.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No cards yet"
            description="This deck is empty. Add cards in the admin editor."
          />
        ) : (
          <ReviewSession cards={deckCards} />
        )}
      </div>
    </PageShell>
  );
}
