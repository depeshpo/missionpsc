"use client";

import { Check, Circle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { NOTES_READ_KEY } from "./progress";

/** Toggle whether a unit's note is marked read. */
export function MarkReadButton({ unitId }: { unitId: string }) {
  const { has, toggle } = useLocalIdSet(NOTES_READ_KEY);
  const read = has(unitId);

  return (
    <Button variant={read ? "secondary" : "outline"} onClick={() => toggle(unitId)}>
      {read ? <Check className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4" />}
      {read ? "Read" : "Mark as read"}
    </Button>
  );
}
