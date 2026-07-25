import { PageSkeleton, CardGridSkeleton } from "@/components/ui/skeletons";

// Covers the learn reading pages (landing, notes, flashcards, current-affairs,
// resources, answers indexes) — mostly card grids.
export default function Loading() {
  return (
    <PageSkeleton>
      <CardGridSkeleton />
    </PageSkeleton>
  );
}
