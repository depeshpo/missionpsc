import { PageSkeleton, ListRowsSkeleton } from "@/components/ui/skeletons";

// Covers the admin hub and every editor list (grouped rows).
export default function Loading() {
  return (
    <PageSkeleton>
      <ListRowsSkeleton count={6} />
    </PageSkeleton>
  );
}
