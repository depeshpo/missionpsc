import { PageSkeleton, ListRowsSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/Skeleton";

// Syllabus is the most-visited study page: a coverage bar over section rows.
export default function Loading() {
  return (
    <PageSkeleton>
      <Skeleton className="mb-6 h-2 w-full max-w-xs rounded-full" />
      <ListRowsSkeleton count={4} />
    </PageSkeleton>
  );
}
