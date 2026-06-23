"use client";

import { useCallback } from "react";
import type { Deck, Flashcard } from "@/lib/types";
import { decks as seedDecks, flashcards as seedCards } from "@/data/flashcards";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for the flashcards collection — the first two-level
 * collection (decks → cards). Cards reference decks by `deckId` and `Deck.cardCount`
 * is derived, so the whole collection is stored as one override value (`{decks,cards}`)
 * to avoid split-write inconsistency; `cardCount` is recomputed on read. Absent
 * (null) = use the seed. Admin editor + public readers both go through it.
 */
export const FLASHCARDS_OVERRIDE_KEY = "flashcards-overrides";

export type FlashcardsData = { decks: Deck[]; cards: Flashcard[] };
const NONE: FlashcardsData | null = null;

/** Recompute each deck's cardCount from the cards so it's never stale. */
function withCounts(data: FlashcardsData): FlashcardsData {
  return {
    cards: data.cards,
    decks: data.decks.map((d) => ({
      ...d,
      cardCount: data.cards.filter((c) => c.deckId === d.id).length,
    })),
  };
}

const seed = (): FlashcardsData => ({ decks: seedDecks, cards: seedCards });

/**
 * Public reader: the overridden collection if one exists, else the seed — with
 * cardCount recomputed. SSR-safe (server snapshot null → seed; first client paint
 * matches the SSR HTML before any override is applied).
 */
export function useFlashcards(): FlashcardsData {
  const [override] = useLocalProgress<FlashcardsData | null>(FLASHCARDS_OVERRIDE_KEY, NONE);
  return withCounts(override ?? seed());
}

/** Admin CRUD over the flashcards collection, persisted to the override. */
export function useFlashcardsAdmin() {
  const [override, setOverride] = useLocalProgress<FlashcardsData | null>(
    FLASHCARDS_OVERRIDE_KEY,
    NONE,
  );
  const data = withCounts(override ?? seed());
  const isOverridden = override !== null;

  const getDeck = useCallback(
    (id: string) => data.decks.find((d) => d.id === id),
    [data.decks],
  );
  const cardsOf = useCallback(
    (deckId: string) => data.cards.filter((c) => c.deckId === deckId),
    [data.cards],
  );

  /** Upsert a deck and replace all of its cards in one write. */
  const saveDeck = useCallback(
    (deck: Deck, cards: Flashcard[]) =>
      setOverride((prev) => {
        const base = prev ?? seed();
        const exists = base.decks.some((d) => d.id === deck.id);
        return {
          decks: exists
            ? base.decks.map((d) => (d.id === deck.id ? deck : d))
            : [...base.decks, deck],
          cards: [...base.cards.filter((c) => c.deckId !== deck.id), ...cards],
        };
      }),
    [setOverride],
  );

  const removeDeck = useCallback(
    (id: string) =>
      setOverride((prev) => {
        const base = prev ?? seed();
        return {
          decks: base.decks.filter((d) => d.id !== id),
          cards: base.cards.filter((c) => c.deckId !== id),
        };
      }),
    [setOverride],
  );

  const reset = useCallback(() => setOverride(NONE), [setOverride]);

  return { decks: data.decks, getDeck, cardsOf, saveDeck, removeDeck, reset, isOverridden };
}
