import type { Bookmark, BookmarkType } from "@/lib/hooks/useBookmarks";
import { getCurrentAffair, formatDate } from "@/data/currentAffairs";
import { getResource } from "@/data/resources";
import { getNoteByUnit } from "@/data/notes";
import { getQuestion, kindLabel } from "@/data/subjective";
import { getFlashcard, getDeck } from "@/data/flashcards";
import { getUnit, getPaper } from "@/data/syllabus";

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

/** Resolve a stored bookmark to display data, or null if the target is gone. */
export function resolveBookmark(b: Bookmark): ResolvedBookmark | null {
  const base = { type: b.type, id: b.id, savedAt: b.savedAt };

  switch (b.type) {
    case "current-affair": {
      const item = getCurrentAffair(b.id);
      if (!item) return null;
      return { ...base, title: item.title, subtitle: formatDate(item.date), href: `/current-affairs/${item.id}` };
    }
    case "resource": {
      const r = getResource(b.id);
      if (!r) return null;
      return { ...base, title: r.title, subtitle: r.category, href: r.url, external: true };
    }
    case "note": {
      const note = getNoteByUnit(b.id);
      const found = getUnit(b.id);
      if (!note || !found) return null;
      return { ...base, title: note.title, subtitle: `Paper ${found.paper.code}`, href: `/notes/${found.paper.id}/${b.id}` };
    }
    case "question": {
      const q = getQuestion(b.id);
      if (!q) return null;
      const paper = getPaper(q.paperId);
      return {
        ...base,
        title: q.prompt,
        subtitle: paper ? `Paper ${paper.code} · ${kindLabel(q.kind)}` : kindLabel(q.kind),
        href: `/answers/${q.paperId}/${q.id}`,
      };
    }
    case "flashcard": {
      const card = getFlashcard(b.id);
      if (!card) return null;
      const deck = getDeck(card.deckId);
      return { ...base, title: card.front, subtitle: deck?.title, href: `/flashcards/${card.deckId}` };
    }
    default:
      return null;
  }
}
