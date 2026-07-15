"use client";

import { Bookmark, BookmarkCheck } from "lucide-react";
import { cn } from "@/lib/cn";
import { Button } from "@/components/ui/Button";
import { useUserBookmarks, type BookmarkType } from "@/lib/hooks/useUserBookmarks";

/**
 * Generic save/unsave toggle for any bookmarkable item. `labeled` → a full
 * Save/Saved button; otherwise an icon-only toggle (for cards/rows).
 */
export function BookmarkButton({
  type,
  id,
  labeled = false,
  className,
}: {
  type: BookmarkType;
  id: string;
  labeled?: boolean;
  className?: string;
}) {
  const { isBookmarked, toggle } = useUserBookmarks();
  const saved = isBookmarked(type, id);
  const Icon = saved ? BookmarkCheck : Bookmark;

  if (labeled) {
    return (
      <Button
        variant={saved ? "secondary" : "outline"}
        onClick={() => toggle(type, id)}
        className={className}
      >
        <Icon className={cn("h-4 w-4", saved && "text-primary")} />
        {saved ? "Saved" : "Save"}
      </Button>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); // don't follow an enclosing Link
        toggle(type, id);
      }}
      aria-pressed={saved}
      aria-label={saved ? "Remove bookmark" : "Bookmark"}
      className={cn(
        "grid h-8 w-8 shrink-0 place-items-center rounded-md transition-colors",
        saved
          ? "text-primary hover:bg-muted"
          : "text-muted-foreground hover:bg-muted hover:text-foreground",
        className,
      )}
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}
