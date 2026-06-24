import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { DeckForm } from "@/components/admin/DeckForm";

export default function NewDeckPage() {
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
      <DeckForm />
    </AdminPageShell>
  );
}
