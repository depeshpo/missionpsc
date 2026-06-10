import type { Paper, QuestionKind, SubjectiveQuestion } from "@/lib/types";
import { papers } from "./syllabus";

// ---------------------------------------------------------------------------
// Subjective answer-writing bank. Placeholder seeds so the flow is usable; the
// real question bank + model answers are hand-authored later by editing the RAW
// array below. Questions attach to real syllabus sections via `sectionId`
// (`${paperId}-s${n}`); the UI reads everything through the accessors at the
// bottom (the future-DB boundary).
// ---------------------------------------------------------------------------

type RawQuestion = {
  sectionId: string;
  kind: QuestionKind;
  marks: number;
  prompt: string;
  passage?: string;
  wordTarget?: number;
  modelAnswer?: string;
  keywords: string[];
};

// Grouped by paper so ids stay stable & readable (`${paperId}-q${n}`).
const RAW: Record<string, RawQuestion[]> = {
  // ===== Paper II — Governance Systems =====
  "main-pii": [
    { sectionId: "main-pii-s1", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Define governance and explain its core characteristics in the context of Nepal's multi-level state structure.",
      keywords: ["accountability", "transparency", "rule of law", "federalism", "responsiveness"],
      modelAnswer: "Placeholder model answer — open with a crisp definition of governance, then treat each characteristic with a Nepal-specific example across the three tiers of government." },
    { sectionId: "main-pii-s2", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Discuss the salient features of the present Constitution of Nepal.",
      keywords: ["federalism", "fundamental rights", "DPSP", "inclusion", "separation of powers"] },
    { sectionId: "main-pii-s3", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "What is public service delivery? Suggest measures to make it citizen-centric in Nepal.",
      keywords: ["service charter", "e-governance", "accountability", "grievance handling"] },
    { sectionId: "main-pii-s4", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Explain the budgeting process in Nepal and the role of social accountability tools.",
      keywords: ["budget cycle", "public audit", "social audit", "fiscal discipline"] },
  ],
  // ===== Paper III — Contemporary Issues =====
  "main-piii": [
    { sectionId: "main-piii-s1", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Analyse the drivers of internal migration and urbanization in Nepal and their social consequences.",
      keywords: ["migration", "urbanization", "remittance", "settlement", "ageing"] },
    { sectionId: "main-piii-s2", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "What is economic diplomacy? How can Nepal leverage it for development?",
      keywords: ["trade", "FDI", "remittance", "tourism", "economic diplomacy"] },
    { sectionId: "main-piii-s3", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Discuss the role of ICT in inclusive development.",
      keywords: ["digital divide", "e-governance", "ICT4D", "access"] },
    { sectionId: "main-piii-s4", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Examine the impacts of climate change on Nepal and the idea of carbon trade.",
      keywords: ["climate change", "carbon trade", "adaptation", "mitigation", "disaster"] },
  ],
  // ===== Paper IV — English Language (mixed formats) =====
  "main-piv": [
    { sectionId: "main-piv-s1", kind: "essay", marks: 20, wordTarget: 900,
      prompt: "Write an essay (800–1000 words) revealing originality and creativity on: \"Diplomacy in the age of social media.\"",
      keywords: ["thesis", "structure", "coherence", "originality"],
      modelAnswer: "Placeholder — outline: hook → thesis → 3 developed body paragraphs (public diplomacy, misinformation, statecraft) → reflective conclusion." },
    { sectionId: "main-piv-s2", kind: "translation", marks: 15,
      prompt: "Translate the following English passage into Nepali, keeping the meaning and tone faithful.",
      passage: "Sample English passage (~200–250 words) on a general topic. Replace with a real passage when authoring; the candidate translates it faithfully into Nepali.",
      keywords: ["faithful", "tone", "register", "idiom"] },
    { sectionId: "main-piv-s3", kind: "comprehension", marks: 15,
      prompt: "Read the passage and answer the five questions that follow (3 marks each).",
      passage: "Sample ~500-word passage. Replace with a real passage and five comprehension questions when authoring.",
      keywords: ["inference", "main idea", "vocabulary in context"] },
    { sectionId: "main-piv-s3", kind: "precis", marks: 15, wordTarget: 165,
      prompt: "Make a précis of the passage in about one-third of its length and supply a suitable title.",
      passage: "Sample ~450–500-word passage. Replace with a real passage when authoring; summarise to one-third length.",
      keywords: ["concise", "title", "one-third length", "own words"] },
    { sectionId: "main-piv-s4", kind: "correspondence", marks: 10,
      prompt: "Draft a first-person note to a foreign mission on a bilateral matter.",
      keywords: ["first-person note", "protocol", "courtesy", "register"],
      modelAnswer: "Template — Heading/Ref · Salutation (\"Excellency,\") · Opening reference to the matter · Body (substance, in the first person, \"I have the honour to…\") · Closing courtesy (\"Accept, Excellency, the assurances of my highest consideration.\") · Signature/Designation · Place & date." },
    { sectionId: "main-piv-s4", kind: "correspondence", marks: 10,
      prompt: "Draft a third-person note verbale conveying a routine communication between ministries/missions.",
      keywords: ["third-person", "note verbale", "impersonal", "courtesy"],
      modelAnswer: "Template — \"The Ministry of Foreign Affairs presents its compliments to … and has the honour to …\" · body in the third person · standard closing courtesy · no signature, initialled · Place & date." },
    { sectionId: "main-piv-s4", kind: "correspondence", marks: 10,
      prompt: "Draft a joint communiqué issued at the conclusion of a bilateral state visit.",
      keywords: ["joint communiqué", "agreed language", "outcomes"],
      modelAnswer: "Template — Title & dateline · paragraphs on the visit & talks · areas of agreement/cooperation · agreements signed · invitation/forward-looking note · issued simultaneously in both capitals." },
    { sectionId: "main-piv-s4", kind: "correspondence", marks: 10,
      prompt: "Draft a press statement announcing the outcome of a high-level diplomatic engagement.",
      keywords: ["press statement", "concise", "attributable"],
      modelAnswer: "Template — Heading \"Press Statement\" · dateline · 2–4 short paragraphs (what happened, who, key outcomes) · neutral, factual register · issuing authority & date." },
  ],
  // ===== Paper V — Foreign Policy & International Relations =====
  "main-pv": [
    { sectionId: "main-pv-s1", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Discuss the guiding principles and determinants of Nepal's foreign policy.",
      keywords: ["non-alignment", "Panchsheel", "UN Charter", "national interest", "sovereign equality"] },
    { sectionId: "main-pv-s2", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Evaluate Nepal's engagement with the United Nations, including UN peacekeeping.",
      keywords: ["UN membership", "peacekeeping", "multilateralism", "reform"] },
    { sectionId: "main-pv-s3", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Explain the role and functions of the Ministry of Foreign Affairs in advancing national interest.",
      keywords: ["MoFA", "missions", "Vienna Convention 1961", "national interest"] },
    { sectionId: "main-pv-s4", kind: "qa", marks: 10, wordTarget: 250,
      prompt: "Critically examine the Nepal–India Treaty of Peace and Friendship, 1950.",
      keywords: ["1950 treaty", "open border", "revision", "sovereignty", "reciprocity"] },
  ],
};

// --- Build typed questions with generated ids ---
export const subjectiveQuestions: SubjectiveQuestion[] = Object.entries(RAW).flatMap(
  ([paperId, qs]) =>
    qs.map((q, i) => ({ id: `${paperId}-q${i + 1}`, paperId, ...q })),
);

// --- Accessors (the data boundary — read through these, not the array) ---
export function questionsByPaper(paperId: string): SubjectiveQuestion[] {
  return subjectiveQuestions.filter((q) => q.paperId === paperId);
}

export function questionsBySection(sectionId: string): SubjectiveQuestion[] {
  return subjectiveQuestions.filter((q) => q.sectionId === sectionId);
}

export function getQuestion(id: string): SubjectiveQuestion | undefined {
  return subjectiveQuestions.find((q) => q.id === id);
}

/** Papers that have a question bank, in syllabus order. */
export function answerablePapers(): Paper[] {
  return papers.filter((p) => questionsByPaper(p.id).length > 0);
}

const KIND_LABELS: Record<QuestionKind, string> = {
  qa: "Q&A",
  essay: "Essay",
  translation: "Translation",
  precis: "Précis",
  comprehension: "Comprehension",
  correspondence: "Correspondence",
};

export function kindLabel(kind: QuestionKind): string {
  return KIND_LABELS[kind];
}
