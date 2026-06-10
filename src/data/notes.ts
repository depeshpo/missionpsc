import type { Note, NoteAttachment, NoteBlock, Paper, Unit } from "@/lib/types";
import { getUnit, papers } from "./syllabus";

// ---------------------------------------------------------------------------
// Study notes, organized by syllabus unit. Placeholder seeds so the reader is
// usable; real prose is hand-authored later by editing the RAW notes below.
// Headings carry a `level` (any depth) → nested TOC; the builder slugs heading
// text into anchor `id`s. The UI reads through the accessors at the bottom.
// ---------------------------------------------------------------------------

// Author shape: heading blocks omit the generated `id`.
type RawBlock =
  | { type: "heading"; level: number; text: string }
  | { type: "paragraph"; text: string }
  | { type: "list"; items: string[] };
type RawNote = {
  unitId: string;
  title: string;
  body: RawBlock[];
  attachments?: NoteAttachment[];
};

const RAW: RawNote[] = [
  {
    unitId: "main-pii-s2-u2",
    title: "Constitution and Law",
    body: [
      { type: "heading", level: 2, text: "Constitutionalism" },
      { type: "paragraph", text: "Placeholder note. Constitutionalism is the idea that government power is defined and limited by a constitution — the rule of law, not of persons." },
      { type: "heading", level: 2, text: "Constitution of Nepal" },
      { type: "heading", level: 3, text: "Salient features" },
      { type: "list", items: ["Federal democratic republic", "Three tiers of government", "Fundamental rights & duties", "Inclusion and proportional representation"] },
      { type: "heading", level: 3, text: "Constitutional bodies" },
      { type: "paragraph", text: "Placeholder — list the constitutional commissions and their mandates here." },
    ],
    attachments: [
      { title: "Constitution of Nepal (2015) — full text", href: "/attachments/sample-constitution-of-nepal.pdf", kind: "pdf" },
      { title: "Nepal Law Commission — constitution portal", href: "https://lawcommission.gov.np/", kind: "link" },
    ],
  },
  {
    unitId: "main-pv-s1-u1",
    title: "Nepal's Foreign Policy",
    body: [
      { type: "heading", level: 2, text: "Guiding principles" },
      { type: "list", items: ["Panchsheel (five principles of peaceful coexistence)", "Non-alignment", "UN Charter and international law", "Sovereign equality and national interest"] },
      { type: "heading", level: 2, text: "Determinants" },
      { type: "paragraph", text: "Placeholder — geography, history, economy, and the geopolitics of being between two large neighbours." },
    ],
  },
  {
    unitId: "main-pv-s3-u7",
    title: "Ministry of Foreign Affairs & Missions",
    body: [
      { type: "heading", level: 2, text: "Role of MoFA" },
      { type: "paragraph", text: "Placeholder — MoFA conducts diplomacy, advances national interest, and coordinates Nepal's external relations." },
      { type: "heading", level: 2, text: "Vienna Conventions" },
      { type: "heading", level: 3, text: "VCDR 1961 (Diplomatic Relations)" },
      { type: "heading", level: 4, text: "Inviolability" },
      { type: "paragraph", text: "Placeholder — the mission premises (Art. 22) and the diplomatic agent (Art. 29) are inviolable." },
      { type: "heading", level: 4, text: "Immunities" },
      { type: "paragraph", text: "Placeholder — immunity from criminal jurisdiction and, with exceptions, civil jurisdiction." },
      { type: "heading", level: 3, text: "VCCR 1963 (Consular Relations)" },
      { type: "paragraph", text: "Placeholder — consular officers enjoy narrower, functional immunity for official acts." },
    ],
  },
  {
    unitId: "main-pv-s4-u8",
    title: "Nepal's Bilateral Treaties",
    body: [
      { type: "heading", level: 2, text: "Nepal–India Treaty of Peace and Friendship, 1950" },
      { type: "paragraph", text: "Placeholder — foundational treaty; open border, national treatment, long debated for revision." },
      { type: "heading", level: 2, text: "Nepal–China Treaty of Peace and Friendship, 1960" },
      { type: "paragraph", text: "Placeholder — established friendly relations and the basis for boundary settlement." },
    ],
  },
];

// --- Build typed notes; generate deduped heading anchor ids ---
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function buildBlocks(raw: RawBlock[]): NoteBlock[] {
  const seen = new Map<string, number>();
  return raw.map((b) => {
    if (b.type !== "heading") return b;
    const base = slug(b.text) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = n === 0 ? base : `${base}-${n}`;
    return { type: "heading", level: b.level, text: b.text, id };
  });
}

export const notes: Note[] = RAW.map((r) => ({
  id: `note-${r.unitId}`,
  unitId: r.unitId,
  title: r.title,
  body: buildBlocks(r.body),
  ...(r.attachments ? { attachments: r.attachments } : {}),
}));

// --- Accessors (the data boundary — read through these, not the array) ---
export interface NoteHeading {
  id: string;
  text: string;
  level: number;
}

/** The heading blocks of a note, for tables of contents and the sidebar tree. */
export function noteHeadings(blocks: NoteBlock[]): NoteHeading[] {
  return blocks
    .filter((b) => b.type === "heading")
    .map((b) => ({ id: b.id, text: b.text, level: b.level }));
}

export function getNoteByUnit(unitId: string): Note | undefined {
  return notes.find((n) => n.unitId === unitId);
}

export function notesByPaper(paperId: string): Note[] {
  return notes.filter((n) => getUnit(n.unitId)?.paper.id === paperId);
}

/** Papers that have at least one note, in syllabus order. */
export function papersWithNotes(): Paper[] {
  return papers.filter((p) => notesByPaper(p.id).length > 0);
}

export interface UnitNote {
  unit: Unit;
  note: Note;
}

/** The units of a paper that have notes, in syllabus order. */
export function unitsWithNotes(paperId: string): UnitNote[] {
  const paper = papers.find((p) => p.id === paperId);
  if (!paper) return [];
  const result: UnitNote[] = [];
  for (const section of paper.sections) {
    for (const unit of section.units) {
      const note = getNoteByUnit(unit.id);
      if (note) result.push({ unit, note });
    }
  }
  return result;
}
