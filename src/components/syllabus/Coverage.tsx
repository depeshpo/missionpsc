"use client";

import { cn } from "@/lib/cn";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { SYLLABUS_PROGRESS_KEY } from "./progress";

/**
 * Completion coverage over a set of unit ids: a "done/total" count and a bar.
 * Reads the shared syllabus progress set, so it updates live as units toggle.
 */
export function Coverage({
  unitIds,
  className,
  showBar = true,
}: {
  unitIds: string[];
  className?: string;
  showBar?: boolean;
}) {
  const { has } = useUserIdSet(SYLLABUS_PROGRESS_KEY);
  const total = unitIds.length;
  const done = unitIds.reduce((n, id) => (has(id) ? n + 1 : n), 0);
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className={cn("space-y-1.5", className)}>
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>
          {done} / {total} units
        </span>
        <span className="tabular-nums">{pct}%</span>
      </div>
      {showBar ? <ProgressBar value={done} max={total} /> : null}
    </div>
  );
}
