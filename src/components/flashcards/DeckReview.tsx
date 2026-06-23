"use client";

import Link from "next/link";
import { ArrowRight, Layers } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { useFlashcards } from "@/lib/hooks/useFlashcards";
import { ReviewSession } from "./ReviewSession";

/**
 * Public review page for a deck, resolved through the admin override (so admin-
 * added/edited decks appear). A missing deck shows an empty state rather than a
 * 404, mirroring the syllabus UnitView.
 */
export function DeckReview({ deckId }: { deckId: string }) {
  const { decks, cards } = useFlashcards();
  const deck = decks.find((d) => d.id === deckId);

  if (!deck) {
    return (
      <PageShell
        title="Deck not available"
        breadcrumbs={[{ label: "Flashcards", href: "/flashcards" }]}
      >
        <EmptyState
          icon={Layers}
          title="This deck is no longer available"
          description="It may have been removed. Browse the available decks."
          action={
            <Link
              href="/flashcards"
              className="inline-flex items-center gap-1 text-sm font-medium text-primary"
            >
              Back to Flashcards
              <ArrowRight className="h-4 w-4" />
            </Link>
          }
        />
      </PageShell>
    );
  }

  const deckCards = cards.filter((c) => c.deckId === deck.id);

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
