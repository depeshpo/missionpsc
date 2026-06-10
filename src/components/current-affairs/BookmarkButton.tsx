"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useLocalIdSet } from "@/lib/hooks/useLocalProgress";
import { BOOKMARKS_CA_KEY } from "./progress";

/**
 * Toggle whether a current-affairs item is bookmarked. `labeled` → a full
 * Save/Saved button (detail page); otherwise an icon-only toggle (feed cards).
 */
export function BookmarkButton({
  id,
  labeled = false,
}: {
  id: string;
  labeled?: boolean;
}) {
  const { has, toggle } = useLocalIdSet(BOOKMARKS_CA_KEY);
  const saved = has(id);
  const Icon = saved ? BookmarkCheck : Bookmark;

  if (labeled) {
    return (
      <Button variant={saved ? "secondary" : "outline"} onClick={() => toggle(id)}>
        <Icon className={cn("h-4 w-4", saved && "text-primary")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); // don't follow the card's Link
        toggle(id);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors",
        saved
          ? "text-primary hover:bg-muted"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
