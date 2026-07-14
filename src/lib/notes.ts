import type { Note, Paper, Section, Unit } from "@/lib/types";

/**
 * Pure list helpers for notes. They take the papers and notes as arguments (both
 * come from the DB now) rather than reaching for the seed, so a note attached to
 * an admin-created unit resolves like any other.
 */

/** Locate a unit and its ancestry within the given papers. */
export function findUnit(
  papers: Paper[],
  unitId: string,
): { unit: Unit; section: Section; paper: Paper } | undefined {
  for (const paper of papers) {
    for (const section of paper.sections) {
      const unit = section.units.find((u) => u.id === unitId);
      if (unit) return { unit, section, paper };
    }
  }
  return undefined;
}

/** Notes belonging to a paper. */
export function notesByPaper(notes: Note[], papers: Paper[], paperId: string): Note[] {
  return notes.filter((n) => findUnit(papers, n.unitId)?.paper.id === paperId);
}

/** Papers that have at least one note, in syllabus order. */
export function papersWithNotes(notes: Note[], papers: Paper[]): Paper[] {
  return papers.filter((p) => notesByPaper(notes, papers, p.id).length > 0);
}

export interface UnitNote {
  unit: Unit;
  note: Note;
}

/** A paper's units that have notes, in syllabus order. */
export function unitsWithNotes(notes: Note[], paper: Paper): UnitNote[] {
  const result: UnitNote[] = [];
  for (const section of paper.sections) {
    for (const unit of section.units) {
      const note = notes.find((n) => n.unitId === unit.id);
      if (note) result.push({ unit, note });
    }
  }
  return result;
}
