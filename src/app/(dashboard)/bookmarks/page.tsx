import { PageShell } from "@/components/layout/PageShell";
import { BookmarksList } from "@/components/bookmarks/BookmarksList";

export default function BookmarksPage() {
  return (
    <PageShell
      title="Bookmarks"
      description="Everything you've saved — current affairs, resources, notes, questions, and flashcards — filterable by type and date."
    >
      <BookmarksList />
    </PageShell>
  );
}
