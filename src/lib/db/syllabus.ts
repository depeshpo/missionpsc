import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { Paper, Section, Unit } from "@/lib/types";

// Server-only DB accessors for the syllabus spine — the read side of B1. Replaces
// reading the TS seed (src/data/syllabus.ts) at runtime; the seed now only feeds
// the one-off seed migration. Rows come back ordered by `position` so the
// author-defined order is preserved. STAGES (static UI metadata) still lives in
// the data module.

type PaperRow = {
  id: string;
  stage: Paper["stage"];
  code: Paper["code"];
  title: string;
  total_marks: number;
  duration_mins: number | null;
  note: string | null;
};
type SectionRow = {
  id: string;
  paper_id: string;
  label: string;
  marks: number;
  pattern: string | null;
};
type UnitRow = {
  id: string;
  section_id: string;
  number: string;
  title: string;
  subtopics: string[];
};

/** Fetch every paper, fully assembled (sections → units), ordered by position. */
export async function getPapers(): Promise<Paper[]> {
  const supabase = await createClient();
  const [papers, sections, units] = await Promise.all([
    supabase.from("papers").select("*").order("position"),
    supabase.from("sections").select("*").order("position"),
    supabase.from("units").select("*").order("position"),
  ]);
  if (papers.error) throw papers.error;
  if (sections.error) throw sections.error;
  if (units.error) throw units.error;

  const unitsBySection = new Map<string, Unit[]>();
  for (const u of (units.data ?? []) as UnitRow[]) {
    const list = unitsBySection.get(u.section_id) ?? [];
    list.push({
      id: u.id,
      sectionId: u.section_id,
      number: u.number,
      title: u.title,
      subtopics: u.subtopics ?? [],
    });
    unitsBySection.set(u.section_id, list);
  }

  const sectionsByPaper = new Map<string, Section[]>();
  for (const s of (sections.data ?? []) as SectionRow[]) {
    const list = sectionsByPaper.get(s.paper_id) ?? [];
    list.push({
      id: s.id,
      paperId: s.paper_id,
      label: s.label,
      marks: s.marks,
      pattern: s.pattern ?? undefined,
      units: unitsBySection.get(s.id) ?? [],
    });
    sectionsByPaper.set(s.paper_id, list);
  }

  return ((papers.data ?? []) as PaperRow[]).map((p) => ({
    id: p.id,
    stage: p.stage,
    code: p.code,
    title: p.title,
    totalMarks: p.total_marks,
    durationMins: p.duration_mins ?? undefined,
    note: p.note ?? undefined,
    sections: sectionsByPaper.get(p.id) ?? [],
  }));
}

/** A single paper by id (data set is small, so this reuses getPapers). */
export async function getPaper(id: string): Promise<Paper | undefined> {
  return (await getPapers()).find((p) => p.id === id);
}
