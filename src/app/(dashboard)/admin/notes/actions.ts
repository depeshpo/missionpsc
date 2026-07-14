"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Note } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

const BUCKET = "note-files";

/**
 * Notes live under three nested dynamic segments (/notes/[paper]/[unit]), so
 * revalidating the layout covers the index, the paper overview and every reader
 * page in one call instead of reconstructing each path.
 */
function revalidate() {
  revalidatePath("/notes", "layout");
  revalidatePath("/admin/notes", "layout");
}

/**
 * Create or update a whole note: upserts the note row, its sections, and each
 * section's videos/files/links (ordered by array index via `position`), then
 * prunes anything the author removed. One note per unit — the id is derived from
 * the unit, so this is always an upsert. RLS requires admin.
 */
export async function saveNote(note: Note): Promise<ActionResult> {
  const supabase = await createClient();

  // Keep the note's position stable on edit; append new notes at the end.
  const { data: existing } = await supabase
    .from("notes")
    .select("position")
    .eq("id", note.id)
    .maybeSingle();
  let position = existing?.position as number | undefined;
  if (position == null) {
    const { count } = await supabase.from("notes").select("*", { count: "exact", head: true });
    position = count ?? 0;
  }

  const { error: noteErr } = await supabase.from("notes").upsert({
    id: note.id,
    unit_id: note.unitId,
    title: note.title,
    position,
  });
  if (noteErr) return { error: noteErr.message };

  // Sections must exist before their children (FK).
  const sectionRows = note.sections.map((s, i) => ({
    id: s.id,
    note_id: note.id,
    heading: s.heading,
    html: s.html,
    position: i,
  }));
  if (sectionRows.length) {
    const { error } = await supabase.from("note_sections").upsert(sectionRows);
    if (error) return { error: error.message };
  }

  const videoRows = note.sections.flatMap((s) =>
    s.videos.map((v, i) => ({ id: v.id, section_id: s.id, url: v.url, position: i })),
  );
  const linkRows = note.sections.flatMap((s) =>
    s.links.map((l, i) => ({
      id: l.id,
      section_id: s.id,
      title: l.title,
      url: l.url,
      position: i,
    })),
  );
  const fileRows = note.sections.flatMap((s) =>
    s.files.map((f, i) => ({
      id: f.id,
      section_id: s.id,
      name: f.name,
      mime: f.mime,
      size: f.size,
      ref: f.ref,
      position: i,
    })),
  );

  if (videoRows.length) {
    const { error } = await supabase.from("note_videos").upsert(videoRows);
    if (error) return { error: error.message };
  }
  if (linkRows.length) {
    const { error } = await supabase.from("note_links").upsert(linkRows);
    if (error) return { error: error.message };
  }
  if (fileRows.length) {
    const { error } = await supabase.from("note_files").upsert(fileRows);
    if (error) return { error: error.message };
  }

  // Prune children removed from the sections we're keeping. (Children of removed
  // sections need no pruning — deleting the section cascades them.)
  const keepSectionIds = note.sections.map((s) => s.id);
  if (keepSectionIds.length) {
    const prune = async (
      table: "note_videos" | "note_links" | "note_files",
      keepIds: string[],
    ) => {
      const keep = new Set(keepIds);
      const { data: existingRows } = await supabase
        .from(table)
        .select("id")
        .in("section_id", keepSectionIds);
      const toDelete = (existingRows ?? [])
        .map((r) => r.id as string)
        .filter((id) => !keep.has(id));
      if (toDelete.length) await supabase.from(table).delete().in("id", toDelete);
    };
    await prune("note_videos", videoRows.map((r) => r.id));
    await prune("note_links", linkRows.map((r) => r.id));
    await prune("note_files", fileRows.map((r) => r.id));
  }

  // Prune sections removed from the note (their children cascade).
  const { data: existingSections } = await supabase
    .from("note_sections")
    .select("id")
    .eq("note_id", note.id);
  const sectionsToDelete = (existingSections ?? [])
    .map((r) => r.id as string)
    .filter((id) => !keepSectionIds.includes(id));
  if (sectionsToDelete.length) {
    await supabase.from("note_sections").delete().in("id", sectionsToDelete);
  }

  revalidate();
  return { ok: true };
}

/**
 * Delete a note. Sections/videos/links/files cascade in Postgres; the attachment
 * blobs are removed from Storage first (best effort) so they aren't orphaned.
 */
export async function deleteNote(id: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: sections } = await supabase
    .from("note_sections")
    .select("id")
    .eq("note_id", id);
  const sectionIds = (sections ?? []).map((s) => s.id as string);
  if (sectionIds.length) {
    const { data: files } = await supabase
      .from("note_files")
      .select("ref")
      .in("section_id", sectionIds);
    const refs = (files ?? []).map((f) => f.ref as string);
    if (refs.length) await supabase.storage.from(BUCKET).remove(refs);
  }

  const { error } = await supabase.from("notes").delete().eq("id", id);
  if (error) return { error: error.message };

  revalidate();
  return { ok: true };
}
