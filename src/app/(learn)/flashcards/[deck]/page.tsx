import { notFound } from "next/navigation";
import { DeckReview } from "@/components/flashcards/DeckReview";
import { getFlashcardsData } from "@/lib/db/flashcards";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: deckId } = await params;
  const { decks, cards } = await getFlashcardsData();
  const deck = decks.find((d) => d.id === deckId);
  if (!deck) notFound();
  return <DeckReview deck={deck} cards={cards.filter((c) => c.deckId === deck.id)} />;
}
