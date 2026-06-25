import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Deck, Flashcard } from "@/lib/types";

// Server-only DB accessors for flashcards (B1) — the first two-level collection.
// Decks + cards are fetched together (ordered by position); each deck's cardCount
// is derived from the cards so it's never stale.

export type FlashcardsData = { decks: Deck[]; cards: Flashcard[] };

type DeckRow = { id: string; title: string; description: string | null };
type CardRow = {
  id: string;
  deck_id: string;
  front: string;
  back: string;
  tags: string[] | null;
};

export async function getFlashcardsData(): Promise<FlashcardsData> {
  const supabase = await createClient();
  const [decks, cards] = await Promise.all([
    supabase.from("decks").select("*").order("position"),
    supabase.from("flashcards").select("*").order("position"),
  ]);
  if (decks.error) throw decks.error;
  if (cards.error) throw cards.error;

  const cardList: Flashcard[] = ((cards.data ?? []) as CardRow[]).map((c) => ({
    id: c.id,
    deckId: c.deck_id,
    front: c.front,
    back: c.back,
    tags: c.tags ?? [],
  }));

  const deckList: Deck[] = ((decks.data ?? []) as DeckRow[]).map((d) => ({
    id: d.id,
    title: d.title,
    description: d.description ?? undefined,
    cardCount: cardList.filter((c) => c.deckId === d.id).length,
  }));

  return { decks: deckList, cards: cardList };
}
