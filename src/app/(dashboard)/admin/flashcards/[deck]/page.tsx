import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DeckForm } from "@/components/admin/DeckForm";
import { getFlashcardsData } from "@/lib/db/flashcards";

export default async function EditDeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  const { deck } = await params;
  const { decks, cards } = await getFlashcardsData();
  return (
    <AdminPageShell
      floatCrumbs
      title="Edit deck"
      description="Update this deck and its cards. Changes show on the public Flashcards page."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Flashcards", href: "/admin/flashcards" },
        { label: "Edit" },
      ]}
    >
      <DeckForm id={deck} decks={decks} cards={cards} />
    </AdminPageShell>
  );
}
