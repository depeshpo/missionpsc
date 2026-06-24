import type { Note, NoteSection, Paper, Unit } from "@/lib/types";
import { getUnit, papers } from "./syllabus";

// ---------------------------------------------------------------------------
// Study notes, organized by syllabus unit. A note has a main title and an
// ordered list of "subtitle" sections; each section has a heading, a rich-text
// HTML body, and optional videos / files / links. Placeholder seeds so the
// reader is usable; real content is authored in /admin/notes. The UI reads
// through the accessors at the bottom (the future-DB boundary).
// ---------------------------------------------------------------------------

// Author shape: sections omit generated ids and default the optional arrays.
type RawSection = {
  heading: string;
  html: string;
  videos?: string[]; // YouTube URLs
  links?: { title: string; url: string }[];
};
type RawNote = {
  unitId: string;
  title: string;
  sections: RawSection[];
};

const RAW: RawNote[] = [
  {
    unitId: "main-pii-s2-u2",
    title: "Constitution and Law",
    sections: [
      {
        heading: "Constitutionalism",
        html: "<p>Placeholder note. <strong>Constitutionalism</strong> is the idea that government power is defined and limited by a constitution — the rule of law, not of persons.</p>",
        links: [
          { title: "Nepal Law Commission — constitution portal", url: "https://lawcommission.gov.np/" },
        ],
      },
      {
        heading: "Constitution of Nepal — salient features",
        html: "<ul><li>Federal democratic republic</li><li>Three tiers of government</li><li>Fundamental rights &amp; duties</li><li>Inclusion and proportional representation</li></ul>",
      },
    ],
  },
  {
    unitId: "main-pv-s1-u1",
    title: "Nepal's Foreign Policy",
    sections: [
      {
        heading: "Guiding principles",
        html: "<ul><li>Panchsheel (five principles of peaceful coexistence)</li><li>Non-alignment</li><li>UN Charter and international law</li><li>Sovereign equality and national interest</li></ul>",
      },
      {
        heading: "Determinants",
        html: "<p>Placeholder — geography, history, economy, and the geopolitics of being between two large neighbours.</p>",
      },
    ],
  },
  {
    unitId: "main-pv-s3-u7",
    title: "Ministry of Foreign Affairs & Missions",
    sections: [
      {
        heading: "Role of MoFA",
        html: "<p>Placeholder — MoFA conducts diplomacy, advances national interest, and coordinates Nepal's external relations.</p>",
      },
      {
        heading: "Vienna Conventions",
        html: "<p>Placeholder — <strong>VCDR 1961</strong>: the mission premises (Art. 22) and the diplomatic agent (Art. 29) are inviolable. <strong>VCCR 1963</strong>: consular officers enjoy narrower, functional immunity for official acts.</p>",
      },
    ],
  },
  {
    unitId: "main-pv-s4-u8",
    title: "Nepal's Bilateral Treaties",
    sections: [
      {
        heading: "Nepal–India Treaty of Peace and Friendship, 1950",
        html: "<p>Placeholder — foundational treaty; open border, national treatment, long debated for revision.</p>",
      },
      {
        heading: "Nepal–China Treaty of Peace and Friendship, 1960",
        html: "<p>Placeholder — established friendly relations and the basis for boundary settlement.</p>",
      },
    ],
  },
];

// --- Build typed notes; mint stable section ids ---
function slug(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/** Deduped section id from its heading (the anchor target). */
function buildSections(unitId: string, raw: RawSection[]): NoteSection[] {
  const seen = new Map<string, number>();
  return raw.map((s) => {
    const base = slug(s.heading) || "section";
    const n = seen.get(base) ?? 0;
    seen.set(base, n + 1);
    const id = `${unitId}-${n === 0 ? base : `${base}-${n}`}`;
    return {
      id,
      heading: s.heading,
      html: s.html,
      videos: (s.videos ?? []).map((url, i) => ({ id: `${id}-v${i + 1}`, url })),
      files: [],
      links: (s.links ?? []).map((l, i) => ({ id: `${id}-l${i + 1}`, ...l })),
    };
  });
}

export const notes: Note[] = RAW.map((r) => ({
  id: `note-${r.unitId}`,
  unitId: r.unitId,
  title: r.title,
  sections: buildSections(r.unitId, r.sections),
}));

// --- Accessors (the data boundary — read through these, not the array) ---
export interface NoteHeading {
  id: string;
  text: string;
  level: number;
}

/** The section headings of a note, for tables of contents and the sidebar tree. */
export function noteHeadings(sections: NoteSection[]): NoteHeading[] {
  return sections.map((s) => ({ id: s.id, text: s.heading, level: 2 }));
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
