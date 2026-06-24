"use client";

import { useCallback } from "react";
import type { Note, Paper } from "@/lib/types";
import { notes, type UnitNote } from "@/data/notes";
import { papers, getUnit } from "@/data/syllabus";
import { useLocalProgress } from "./useLocalProgress";

/**
 * localStorage override layer for study notes — a flat collection keyed to
 * syllabus units (one note per unit, id `note-${unitId}`). Stores the whole
 * effective list (`Note[] | null`; null = seed). Admin editor + the public
 * /notes pages (incl. the sidebar layout) both read through it.
 */
export const NOTES_OVERRIDE_KEY = "notes-overrides";

const NONE: Note[] | null = null;

export function getNoteByUnitFrom(list: Note[], unitId: string): Note | undefined {
  return list.find((n) => n.unitId === unitId);
}

export function notesByPaperFrom(list: Note[], paperId: string): Note[] {
  return list.filter((n) => getUnit(n.unitId)?.paper.id === paperId);
}

/** Papers that have at least one note, in syllabus order — reflects the list. */
export function papersWithNotesFrom(list: Note[]): Paper[] {
  return papers.filter((p) => notesByPaperFrom(list, p.id).length > 0);
}

/** Units of a paper that have notes, in syllabus order — reflects the list. */
export function unitsWithNotesFrom(list: Note[], paperId: string): UnitNote[] {
  const paper = papers.find((p) => p.id === paperId);
  if (!paper) return [];
  const result: UnitNote[] = [];
  for (const section of paper.sections) {
    for (const unit of section.units) {
      const note = getNoteByUnitFrom(list, unit.id);
      if (note) result.push({ unit, note });
    }
  }
  return result;
}

/**
 * Public reader: the overridden list if one exists, else the seed. SSR-safe
 * (server snapshot is null → seed; first client paint matches the SSR HTML).
 */
export function useNotes(): Note[] {
  const [override] = useLocalProgress<Note[] | null>(NOTES_OVERRIDE_KEY, NONE);
  return override ?? notes;
}

/** Admin CRUD over the notes collection, persisted to the override. */
export function useNotesAdmin() {
  const [override, setOverride] = useLocalProgress<Note[] | null>(NOTES_OVERRIDE_KEY, NONE);
  const list = override ?? notes;
  const isOverridden = override !== null;

  const getNote = useCallback(
    (id: string) => list.find((n) => n.id === id),
    [list],
  );

  /** Upsert by id (one note per unit, so a unit's note is replaced in place). */
  const saveNote = useCallback(
    (note: Note) =>
      setOverride((prev) => {
        const base = prev ?? notes;
        return base.some((n) => n.id === note.id)
          ? base.map((n) => (n.id === note.id ? note : n))
          : [...base, note];
      }),
    [setOverride],
  );

  const remove = useCallback(
    (id: string) => setOverride((prev) => (prev ?? notes).filter((n) => n.id !== id)),
    [setOverride],
  );

  const reset = useCallback(() => setOverride(NONE), [setOverride]);

  return { list, getNote, saveNote, remove, reset, isOverridden };
}
