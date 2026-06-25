import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DeckForm } from "@/components/admin/DeckForm";
import { getFlashcardsData } from "@/lib/db/flashcards";

export default async function NewDeckPage() {
  const { decks, cards } = await getFlashcardsData();
  return (
    <AdminPageShell
      floatCrumbs
      title="New deck"
      description="Add a flashcard deck and its cards."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Flashcards", href: "/admin/flashcards" },
        { label: "New" },
      ]}
    >
      <DeckForm decks={decks} cards={cards} />
    </AdminPageShell>
  );
}
