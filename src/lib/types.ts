// Core domain types for the Mission PSC portal.
// Source of truth: Nepal Lok Sewa Section Officer (Foreign Service) syllabus.
// See docs/PLAN.md for the full exam structure.

// Scope: subjective study only (Stage II Main + Interview). The objective MCQ
// stage (prelim) is a separate product and its types live there, not here.
export type Stage = "main" | "interview";

export type PaperCode = "I" | "II" | "III" | "IV" | "V";

/** A unit/chapter within a section of a paper. */
export interface Unit {
  id: string;
  sectionId: string;
  /** Syllabus numbering, e.g. "1.2" or "2.3.1". */
  number: string;
  title: string;
  subtopics: string[];
}

/** A marked section (A/B/C/D, or Part A/B/C) inside a paper. */
export interface Section {
  id: string;
  paperId: string;
  /** Display label, e.g. "Section A", "Part A — General Awareness". */
  label: string;
  marks: number;
  /** Question pattern, e.g. "10×3=30" or "50×1=50". */
  pattern?: string;
  units: Unit[];
}

/** A paper within an exam stage. */
export interface Paper {
  id: string;
  stage: Stage;
  code: PaperCode;
  title: string;
  totalMarks: number;
  durationMins?: number;
  /** Short note, e.g. "Main · 10×10" or "Extra Paper I (Foreign Service)". */
  note?: string;
  sections: Section[];
}

// ---- Content types (placeholder data; hand-authored later) ----

/**
 * Format of a subjective question. Most papers are knowledge Q&A; Paper IV
 * (English) mixes essay, translation, précis, comprehension and diplomatic
 * correspondence — `kind` lets one type cover them all.
 */
export type QuestionKind =
  | "qa"
  | "essay"
  | "translation"
  | "precis"
  | "comprehension"
  | "correspondence";

export interface SubjectiveQuestion {
  id: string;
  paperId: string;
  sectionId: string;
  kind: QuestionKind;
  marks: number;
  prompt: string;
  /** Source text to work from (translation / précis / comprehension). */
  passage?: string;
  wordTarget?: number;
  /** Reference answer, or the format/template for `correspondence`. */
  modelAnswer?: string;
  keywords: string[];
}

export interface Flashcard {
  id: string;
  deckId: string;
  front: string;
  back: string;
  tags: string[];
}

export interface Deck {
  id: string;
  title: string;
  description?: string;
  cardCount: number;
}

/**
 * A block of note content. Headings carry an arbitrary `level` (1..n) so the
 * reader can build a nested table of contents, and an `id` anchor generated at
 * build time. Typed blocks now; MDX is the likely future format.
 */
export type NoteBlock =
  | { type: "heading"; level: number; text: string; id: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };

/** A file/link attached to a note (e.g. a source PDF). Display deferred. */
export interface NoteAttachment {
  title: string;
  href: string;
  kind?: "pdf" | "link";
}

export interface Note {
  id: string;
  /** Syllabus unit this note belongs to. */
  unitId: string;
  title: string;
  body: NoteBlock[];
  attachments?: NoteAttachment[];
}

export interface CurrentAffairItem {
  id: string;
  date: string; // ISO
  scope: "national" | "international";
  title: string;
  summary: string;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  url: string;
  description?: string;
}
