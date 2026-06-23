import { PageShell } from "@/components/layout/PageShell";
import { DeckGrid } from "@/components/flashcards/DeckGrid";

export default function FlashcardsPage() {
  return (
    <PageShell
      title="Flashcards"
      description="Flip-card decks for rote recall — diplomatic terms, treaties, Vienna articles, IR theories, and organizations."
    >
      <DeckGrid />
    </PageShell>
  );
}
