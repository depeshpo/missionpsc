import { PageSkeleton, StatGridSkeleton } from "@/components/ui/skeletons";
import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <PageSkeleton>
      <div className="grid gap-4 sm:grid-cols-2">
        <Skeleton className="h-28" />
        <Skeleton className="h-28" />
      </div>
      <div className="mt-8">
        <StatGridSkeleton count={5} />
      </div>
    </PageSkeleton>
  );
}
