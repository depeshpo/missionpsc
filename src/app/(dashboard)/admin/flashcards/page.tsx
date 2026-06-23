import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { FlashcardsAdminList } from "@/components/admin/FlashcardsAdminList";

export default function AdminFlashcardsPage() {
  return (
    <AdminPageShell
      title="Flashcards"
      description="Manage the decks and cards learners review."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Flashcards" },
      ]}
      actions={
        <Link
          href="/admin/flashcards/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New deck
        </Link>
      }
    >
      <FlashcardsAdminList />
    </AdminPageShell>
  );
}
