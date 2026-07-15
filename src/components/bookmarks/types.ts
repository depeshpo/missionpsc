import type { BookmarkType } from "@/lib/hooks/useUserBookmarks";

/** A bookmark resolved to display data. Client-safe (no server/seed imports). */
export interface ResolvedBookmark {
  type: BookmarkType;
  id: string;
  savedAt: number;
  title: string;
  subtitle?: string;
  href: string;
  /** External (resource) links open in a new tab. */
  external?: boolean;
}

export const TYPE_LABELS: Record<BookmarkType, string> = {
  "current-affair": "Current Affairs",
  resource: "Resource",
  note: "Note",
  question: "Question",
  flashcard: "Flashcard",
};
