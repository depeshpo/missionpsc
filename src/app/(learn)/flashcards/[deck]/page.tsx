import { DeckReview } from "@/components/flashcards/DeckReview";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: deckId } = await params;
  return <DeckReview deckId={deckId} />;
}
