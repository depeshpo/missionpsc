"use client";

import { Check } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { SYLLABUS_PROGRESS_KEY } from "./progress";

/**
 * Toggle a unit's completion in the shared syllabus progress set.
 * Renders a checkbox; pass `label` to show the unit text beside it.
 */
export function UnitCheckbox({
  unitId,
  label,
  className,
}: {
  unitId: string;
  label?: string;
  className?: string;
}) {
  const { has, toggle } = useUserIdSet(SYLLABUS_PROGRESS_KEY);
  const done = has(unitId);

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={done}
      aria-label={label ? undefined : "Mark unit complete"}
      onClick={() => toggle(unitId)}
      className={cn(
        "inline-flex items-center gap-2 text-left",
        className,
      )}
    >
      <span
        className={cn(
          "grid h-5 w-5 shrink-0 place-items-center rounded-md border transition-colors",
          done
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-card text-transparent hover:border-primary/50",
        )}
      >
        <Check className="h-3.5 w-3.5" />
      </span>
      {label ? (
        <span className={cn("text-sm", done && "text-muted-foreground line-through")}>
          {label}
        </span>
      ) : null}
    </button>
  );
}
