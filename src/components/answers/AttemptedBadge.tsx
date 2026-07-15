"use client";

import { cn } from "@/lib/cn";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { ANSWERS_ATTEMPTED_KEY } from "./progress";

/** A small filled/empty dot showing whether one question has been attempted. */
export function AttemptedDot({ questionId }: { questionId: string }) {
  const { has } = useUserIdSet(ANSWERS_ATTEMPTED_KEY);
  const done = has(questionId);
  return (
    <span
      aria-label={done ? "Attempted" : "Not attempted"}
      className={cn(
        "inline-block h-2 w-2 shrink-0 rounded-full",
        done ? "bg-success" : "bg-border",
      )}
    />
  );
}

/** "x / n attempted" count over a set of question ids. */
export function AttemptedCount({
  questionIds,
  className,
}: {
  questionIds: string[];
  className?: string;
}) {
  const { has } = useUserIdSet(ANSWERS_ATTEMPTED_KEY);
  const done = questionIds.reduce((n, id) => (has(id) ? n + 1 : n), 0);
  return (
    <span className={cn("text-xs text-muted-foreground tabular-nums", className)}>
      {done} / {questionIds.length} attempted
    </span>
  );
}
