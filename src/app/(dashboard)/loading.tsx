import { PageSkeleton, ListRowsSkeleton } from "@/components/ui/skeletons";

// Generic dashboard-surface fallback (settings and anything without a more
// specific loading state).
export default function Loading() {
  return (
    <PageSkeleton>
      <ListRowsSkeleton count={4} />
    </PageSkeleton>
  );
}
