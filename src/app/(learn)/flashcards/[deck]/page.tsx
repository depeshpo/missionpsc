import { notFound } from "next/navigation";
import { Layers } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { EmptyState } from "@/components/ui/EmptyState";
import { getDeck, cardsByDeck } from "@/data/flashcards";
import { ReviewSession } from "@/components/flashcards/ReviewSession";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck: deckId } = await params;
  const deck = getDeck(deckId);
  if (!deck) notFound();

  const cards = cardsByDeck(deck.id);

  return (
    <PageShell
      title={deck.title}
      description={deck.description}
      breadcrumbs={[{ label: "Flashcards", href: "/flashcards" }, { label: deck.title }]}
    >
      <div className="mx-auto max-w-xl">
        {cards.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No cards yet"
            description="This deck is empty. Cards are authored in src/data/flashcards.ts."
          />
        ) : (
          <ReviewSession cards={cards} />
        )}
      </div>
    </PageShell>
  );
}
