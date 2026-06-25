"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { Paper } from "@/lib/types";

export type ActionResult = { ok: true } | { error: string };

/**
 * Create or update a whole paper: upserts the paper row + its sections + units
 * (ordered by array index via `position`) and prunes any sections/units that
 * were removed. Covers the edit form, create form, drag-reorder, and
 * section-delete — all just persist the new whole-`Paper`. RLS requires admin.
 */
export async function savePaper(paper: Paper): Promise<ActionResult> {
  const supabase = await createClient();

  const { error: paperErr } = await supabase.from("papers").upsert({
    id: paper.id,
    stage: paper.stage,
    code: paper.code,
    title: paper.title,
    total_marks: paper.totalMarks,
    duration_mins: paper.durationMins ?? null,
    note: paper.note ?? null,
  });
  if (paperErr) return { error: paperErr.message };

  // Sections must exist before units (FK). Upsert current, then prune removed.
  const sectionRows = paper.sections.map((s, i) => ({
    id: s.id,
    paper_id: paper.id,
    label: s.label,
    marks: s.marks,
    pattern: s.pattern ?? null,
    position: i,
  }));
  if (sectionRows.length) {
    const { error } = await supabase.from("sections").upsert(sectionRows);
    if (error) return { error: error.message };
  }

  const unitRows = paper.sections.flatMap((s) =>
    s.units.map((u, i) => ({
      id: u.id,
      section_id: s.id,
      number: u.number,
      title: u.title,
      subtopics: u.subtopics,
      position: i,
    })),
  );
  if (unitRows.length) {
    const { error } = await supabase.from("units").upsert(unitRows);
    if (error) return { error: error.message };
  }

  const keepSectionIds = paper.sections.map((s) => s.id);
  const keepUnitIds = new Set(unitRows.map((u) => u.id));

  // Prune units removed from sections we're keeping.
  if (keepSectionIds.length) {
    const { data: existingUnits } = await supabase
      .from("units")
      .select("id")
      .in("section_id", keepSectionIds);
    const unitsToDelete = (existingUnits ?? [])
      .map((r) => r.id as string)
      .filter((id) => !keepUnitIds.has(id));
    if (unitsToDelete.length) {
      await supabase.from("units").delete().in("id", unitsToDelete);
    }
  }

  // Prune sections removed from the paper (cascade deletes their units).
  const { data: existingSections } = await supabase
    .from("sections")
    .select("id")
    .eq("paper_id", paper.id);
  const sectionsToDelete = (existingSections ?? [])
    .map((r) => r.id as string)
    .filter((id) => !keepSectionIds.includes(id));
  if (sectionsToDelete.length) {
    await supabase.from("sections").delete().in("id", sectionsToDelete);
  }

  revalidatePath("/syllabus");
  revalidatePath(`/syllabus/${paper.id}`);
  revalidatePath("/admin/syllabus");
  revalidatePath(`/admin/syllabus/${paper.id}`);
  return { ok: true };
}

/** Delete a paper (sections + units cascade). RLS requires admin. */
export async function deletePaper(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase.from("papers").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/syllabus");
  revalidatePath("/admin/syllabus");
  return { ok: true };
}
