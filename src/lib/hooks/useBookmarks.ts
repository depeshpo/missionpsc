"use client";

import { useCallback } from "react";
import { useLocalProgress } from "./useLocalProgress";

/** Content types that can be bookmarked. */
export type BookmarkType =
  | "current-affair"
  | "resource"
  | "note"
  | "question"
  | "flashcard";

export interface Bookmark {
  type: BookmarkType;
  id: string;
  /** Epoch ms when saved — powers the Bookmarks date filter. */
  savedAt: number;
}

/**
 * Unified bookmark store across all content types, backed by localStorage (the
 * future-DB swap point). Records carry a `savedAt` timestamp so the Bookmarks
 * page can filter by date.
 */
export function useBookmarks() {
  const [bookmarks, setBookmarks] = useLocalProgress<Bookmark[]>("bookmarks", []);

  const isBookmarked = useCallback(
    (type: BookmarkType, id: string) =>
      bookmarks.some((b) => b.type === type && b.id === id),
    [bookmarks],
  );

  const toggle = useCallback(
    (type: BookmarkType, id: string) =>
      setBookmarks((prev) =>
        prev.some((b) => b.type === type && b.id === id)
          ? prev.filter((b) => !(b.type === type && b.id === id))
          : [...prev, { type, id, savedAt: Date.now() }],
      ),
    [setBookmarks],
  );

  return { bookmarks, isBookmarked, toggle };
}
