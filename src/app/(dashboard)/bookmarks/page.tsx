import { PageShell } from "@/components/layout/PageShell";
import { BookmarksList } from "@/components/bookmarks/BookmarksList";
import { getResolvedBookmarks } from "@/components/bookmarks/resolve";

export default async function BookmarksPage() {
  const items = await getResolvedBookmarks();

  return (
    <PageShell
      title="Bookmarks"
      description="Everything you've saved — current affairs, resources, notes, questions, and flashcards — filterable by type and date."
    >
      <BookmarksList items={items} />
    </PageShell>
  );
}
