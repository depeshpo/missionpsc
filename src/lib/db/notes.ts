import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Note, NoteFile, NoteLink, NoteSection, NoteVideo } from "@/lib/types";

// Server-only DB accessors for study notes — the last content type migrated in B1.
// Notes are three levels deep (note → sections → videos | files | links), so every
// table is fetched once and re-nested by parent id. Rows come back ordered by
// `position`, which is where the author-defined order lives (in TS it's just the
// array index).

type NoteRow = { id: string; unit_id: string; title: string };
type SectionRow = { id: string; note_id: string; heading: string; html: string };
type VideoRow = { id: string; section_id: string; url: string };
type LinkRow = { id: string; section_id: string; title: string; url: string };
type FileRow = {
  id: string;
  section_id: string;
  name: string;
  mime: string;
  size: number;
  ref: string;
};

/** Group child rows under their parent id, preserving fetch (position) order. */
function groupBy<Row, T>(
  rows: Row[],
  parentId: (row: Row) => string,
  map: (row: Row) => T,
): Map<string, T[]> {
  const out = new Map<string, T[]>();
  for (const row of rows) {
    const key = parentId(row);
    const list = out.get(key) ?? [];
    list.push(map(row));
    out.set(key, list);
  }
  return out;
}

/** Every note, fully assembled (sections → videos/files/links), ordered by position. */
export async function getNotes(): Promise<Note[]> {
  const supabase = await createClient();
  const [notes, sections, videos, links, files] = await Promise.all([
    supabase.from("notes").select("*").order("position"),
    supabase.from("note_sections").select("*").order("position"),
    supabase.from("note_videos").select("*").order("position"),
    supabase.from("note_links").select("*").order("position"),
    supabase.from("note_files").select("*").order("position"),
  ]);
  if (notes.error) throw notes.error;
  if (sections.error) throw sections.error;
  if (videos.error) throw videos.error;
  if (links.error) throw links.error;
  if (files.error) throw files.error;

  const videosBySection = groupBy(
    (videos.data ?? []) as VideoRow[],
    (v) => v.section_id,
    (v): NoteVideo => ({ id: v.id, url: v.url }),
  );
  const linksBySection = groupBy(
    (links.data ?? []) as LinkRow[],
    (l) => l.section_id,
    (l): NoteLink => ({ id: l.id, title: l.title, url: l.url }),
  );
  const filesBySection = groupBy(
    (files.data ?? []) as FileRow[],
    (f) => f.section_id,
    (f): NoteFile => ({ id: f.id, name: f.name, mime: f.mime, size: f.size, ref: f.ref }),
  );

  const sectionsByNote = groupBy(
    (sections.data ?? []) as SectionRow[],
    (s) => s.note_id,
    (s): NoteSection => ({
      id: s.id,
      heading: s.heading,
      html: s.html,
      videos: videosBySection.get(s.id) ?? [],
      files: filesBySection.get(s.id) ?? [],
      links: linksBySection.get(s.id) ?? [],
    }),
  );

  return ((notes.data ?? []) as NoteRow[]).map((n) => ({
    id: n.id,
    unitId: n.unit_id,
    title: n.title,
    sections: sectionsByNote.get(n.id) ?? [],
  }));
}

/** A single note by id (the data set is small, so this reuses getNotes). */
export async function getNote(id: string): Promise<Note | undefined> {
  return (await getNotes()).find((n) => n.id === id);
}

/** The note for a syllabus unit — one note per unit. */
export async function getNoteByUnit(unitId: string): Promise<Note | undefined> {
  return (await getNotes()).find((n) => n.unitId === unitId);
}
