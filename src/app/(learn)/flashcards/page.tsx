import { PageShell } from "@/components/layout/PageShell";
import { DeckGrid } from "@/components/flashcards/DeckGrid";
import { getFlashcardsData } from "@/lib/db/flashcards";

export default async function FlashcardsPage() {
  const { decks, cards } = await getFlashcardsData();
  return (
    <PageShell
      title="Flashcards"
      description="Flip-card decks for rote recall — diplomatic terms, treaties, Vienna articles, IR theories, and organizations."
    >
      <DeckGrid decks={decks} cards={cards} />
    </PageShell>
  );
}
