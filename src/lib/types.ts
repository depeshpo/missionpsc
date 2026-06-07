// Core domain types for the Mission PSC portal.
// Source of truth: Nepal Lok Sewa Section Officer (Foreign Service) syllabus.
// See docs/PLAN.md for the full exam structure.

export type Stage = "prelim" | "main" | "interview";

export type PaperType = "objective" | "subjective";

export type PaperCode = "I" | "II" | "III" | "IV" | "V";

/** Level I (simpler 4-option MCQ) vs Level II (harder objective types). */
export type Level = "I" | "II";

export type QuestionType = "mcq" | "match" | "truefalse" | "fill";

/** A unit/chapter within a section of a paper. */
export interface Unit {
  id: string;
  sectionId: string;
  /** Syllabus numbering, e.g. "1.2" or "2.3.1". */
  number: string;
  title: string;
  /** Only meaningful for the Level-graded General Awareness units. */
  level?: Level;
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
  type: PaperType;
  /** Short note, e.g. "Qualifying" or "Extra Paper I (Foreign Service)". */
  note?: string;
  sections: Section[];
}

// ---- Content types (placeholder data; hand-authored later) ----

export interface Question {
  id: string;
  unitId: string;
  level?: Level;
  type: QuestionType;
  stem: string;
  options: string[];
  /** Index into `options` (single-answer) for mcq/truefalse. */
  answer: number;
  explanation?: string;
  source?: string;
}

export interface SubjectiveQuestion {
  id: string;
  paperId: string;
  sectionId: string;
  marks: number;
  prompt: string;
  wordTarget?: number;
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

export interface Note {
  id: string;
  unitId: string;
  title: string;
  /** Plain text / markdown body. Format finalized later. */
  body: string;
}

export interface CurrentAffairItem {
  id: string;
  date: string; // ISO
  scope: "national" | "international";
  title: string;
  summary: string;
}

export interface MockTest {
  id: string;
  title: string;
  stage: Stage;
  type: PaperType;
  durationMins: number;
  questionCount: number;
}

export interface Resource {
  id: string;
  title: string;
  category: string;
  url: string;
  description?: string;
}
