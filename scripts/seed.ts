/**
 * One-off seed migration: pushes the TS seed data (src/data/*.ts) into Supabase.
 * Idempotent — upserts on `id`, so it can be re-run safely.
 *
 *   npm run seed            (= tsx --env-file=.env.local scripts/seed.ts)
 *
 * Uses the service-role key (bypasses RLS). Server/CLI only — never ship this key.
 */
import { createClient } from "@supabase/supabase-js";

import { papers } from "../src/data/syllabus";
import { subjectiveQuestions } from "../src/data/subjective";
import { decks, flashcards } from "../src/data/flashcards";
import { notes } from "../src/data/notes";
import { currentAffairs } from "../src/data/currentAffairs";
import { resources } from "../src/data/resources";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !serviceKey) {
  console.error(
    "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY. " +
      "Copy .env.example to .env.local and fill it, then run `npm run seed`.",
  );
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function upsert(table: string, rows: Record<string, unknown>[]) {
  if (!rows.length) {
    console.log(`  ${table}: (no rows)`);
    return;
  }
  const { error } = await db.from(table).upsert(rows, { onConflict: "id" });
  if (error) {
    console.error(`  ${table}: FAILED — ${error.message}`);
    throw error;
  }
  console.log(`  ${table}: ${rows.length}`);
}

// --- Flatten the nested domain shapes into table rows (carrying `position`) ---

const paperRows = papers.map((p, i) => ({
  id: p.id,
  stage: p.stage,
  code: p.code,
  title: p.title,
  total_marks: p.totalMarks,
  duration_mins: p.durationMins ?? null,
  note: p.note ?? null,
  position: i,
}));
const sectionRows = papers.flatMap((p) =>
  p.sections.map((s, i) => ({
    id: s.id,
    paper_id: p.id,
    label: s.label,
    marks: s.marks,
    pattern: s.pattern ?? null,
    position: i,
  })),
);
const unitRows = papers.flatMap((p) =>
  p.sections.flatMap((s) =>
    s.units.map((u, i) => ({
      id: u.id,
      section_id: s.id,
      number: u.number,
      title: u.title,
      subtopics: u.subtopics,
      position: i,
    })),
  ),
);

const questionRows = subjectiveQuestions.map((q, i) => ({
  id: q.id,
  paper_id: q.paperId,
  section_id: q.sectionId,
  kind: q.kind,
  marks: q.marks,
  prompt: q.prompt,
  passage: q.passage ?? null,
  word_target: q.wordTarget ?? null,
  model_answer: q.modelAnswer ?? null,
  keywords: q.keywords,
  position: i,
}));

const deckRows = decks.map((d, i) => ({
  id: d.id,
  title: d.title,
  description: d.description ?? null,
  position: i,
}));
const cardCounters = new Map<string, number>();
const flashcardRows = flashcards.map((c) => {
  const pos = cardCounters.get(c.deckId) ?? 0;
  cardCounters.set(c.deckId, pos + 1);
  return {
    id: c.id,
    deck_id: c.deckId,
    front: c.front,
    back: c.back,
    tags: c.tags,
    position: pos,
  };
});

const noteRows = notes.map((n, i) => ({
  id: n.id,
  unit_id: n.unitId,
  title: n.title,
  position: i,
}));
const noteSectionRows = notes.flatMap((n) =>
  n.sections.map((s, i) => ({
    id: s.id,
    note_id: n.id,
    heading: s.heading,
    html: s.html,
    position: i,
  })),
);
const noteVideoRows = notes.flatMap((n) =>
  n.sections.flatMap((s) =>
    s.videos.map((v, i) => ({ id: v.id, section_id: s.id, url: v.url, position: i })),
  ),
);
const noteLinkRows = notes.flatMap((n) =>
  n.sections.flatMap((s) =>
    s.links.map((l, i) => ({
      id: l.id,
      section_id: s.id,
      title: l.title,
      url: l.url,
      position: i,
    })),
  ),
);
const noteFileRows = notes.flatMap((n) =>
  n.sections.flatMap((s) =>
    s.files.map((f, i) => ({
      id: f.id,
      section_id: s.id,
      name: f.name,
      mime: f.mime,
      size: f.size,
      ref: f.ref,
      position: i,
    })),
  ),
);

const currentAffairRows = currentAffairs.map((a) => ({
  id: a.id,
  date: a.date,
  scope: a.scope,
  title: a.title,
  summary: a.summary,
  body: a.body ?? null,
  source_title: a.source?.title ?? null,
  source_href: a.source?.href ?? null,
  tags: a.tags ?? [],
}));

const resourceRows = resources.map((r, i) => ({
  id: r.id,
  title: r.title,
  category: r.category,
  url: r.url,
  description: r.description ?? null,
  position: i,
}));

async function main() {
  console.log("Seeding Supabase from src/data/*.ts …");
  // Parents before children (FK order).
  await upsert("papers", paperRows);
  await upsert("sections", sectionRows);
  await upsert("units", unitRows);
  await upsert("subjective_questions", questionRows);
  await upsert("decks", deckRows);
  await upsert("flashcards", flashcardRows);
  await upsert("notes", noteRows);
  await upsert("note_sections", noteSectionRows);
  await upsert("note_videos", noteVideoRows);
  await upsert("note_links", noteLinkRows);
  await upsert("note_files", noteFileRows);
  await upsert("current_affairs", currentAffairRows);
  await upsert("resources", resourceRows);
  console.log("Done.");
}

main().catch(() => process.exit(1));
