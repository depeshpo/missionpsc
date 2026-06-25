"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Deck, Flashcard } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

function revalidate(deckId?: string) {
  revalidatePath("/flashcards");
  revalidatePath("/admin/flashcards");
  if (deckId) {
    revalidatePath(`/flashcards/${deckId}`);
    revalidatePath(`/admin/flashcards/${deckId}`);
  }
}

/**
 * Upsert a deck and replace all of its cards in one write. Cards ordered by
 * array index via `position`; cards removed from the deck are pruned. RLS admin.
 */
export async function saveDeck(deck: Deck, cards: Flashcard[]): Promise<ActionResult> {
  const supabase = await createClient();

  // Keep the deck's position stable on edit; append new decks at the end.
  const { data: existing } = await supabase
    .from("decks")
    .select("position")
    .eq("id", deck.id)
    .maybeSingle();
  let position = existing?.position as number | undefined;
  if (position == null) {
    const { count } = await supabase
      .from("decks")
      .select("*", { count: "exact", head: true });
    position = count ?? 0;
  }

  const { error: deckErr } = await supabase.from("decks").upsert({
    id: deck.id,
    title: deck.title,
    description: deck.description ?? null,
    position,
  });
  if (deckErr) return { error: deckErr.message };

  // Cards must reference an existing deck (FK) — upsert after the deck.
  if (cards.length) {
    const cardRows = cards.map((c, i) => ({
      id: c.id,
      deck_id: deck.id,
      front: c.front,
      back: c.back,
      tags: c.tags,
      position: i,
    }));
    const { error } = await supabase.from("flashcards").upsert(cardRows);
    if (error) return { error: error.message };
  }

  // Prune cards removed from this deck.
  const keep = new Set(cards.map((c) => c.id));
  const { data: existingCards } = await supabase
    .from("flashcards")
    .select("id")
    .eq("deck_id", deck.id);
  const toDelete = (existingCards ?? [])
    .map((r) => r.id as string)
    .filter((id) => !keep.has(id));
  if (toDelete.length) {
    await supabase.from("flashcards").delete().in("id", toDelete);
  }

  revalidate(deck.id);
  return { ok: true };
}

/** Delete a deck (its cards cascade). RLS admin. */
export async function deleteDeck(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("decks").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidate(id);
  return { ok: true };
}
