/**
 * Copy a snapshot of PROD **content** into the LOCAL Supabase stack.
 *
 *   npm run snapshot:local     (= tsx --env-file=.env.local scripts/copy-prod-content.ts)
 *
 * - READS prod content with the prod **anon** key (content is public-read via RLS,
 *   so no prod service-role is needed or touched here). Prod URL + anon key are read
 *   from .env.prod.local.
 * - WRITES into local with the local **service-role** key (from .env.local), upserting
 *   on `id` so it is idempotent and re-runnable.
 * - Copies **content only** (the 13 tables below). The per-user tables
 *   (user_progress, answer_drafts, user_bookmarks) and profiles are intentionally
 *   skipped — they FK to auth.users; dev gets a fresh local admin instead.
 * - Storage blobs (note-files) are NOT copied here — see scripts/copy-note-files.ts.
 *
 * SAFETY: refuses to write anywhere but a local URL.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

// Content tables in FK / dependency order (parents before children).
const TABLES = [
  "papers",
  "sections",
  "units",
  "subjective_questions",
  "decks",
  "flashcards",
  "notes",
  "note_sections",
  "note_videos",
  "note_links",
  "note_files",
  "current_affairs",
  "resources",
] as const;

const localUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const localServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!localUrl || !localServiceKey) {
  console.error("Missing local NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(localUrl)) {
  console.error(
    `Refusing to write: local target "${localUrl}" is not a local URL (127.0.0.1). ` +
      "This script only ever writes to the local dev stack.",
  );
  process.exit(1);
}

// Read PROD source (URL + anon key) from .env.prod.local so it never collides with
// the local vars already in process.env.
function readEnvFile(path: string): Record<string, string> {
  const out: Record<string, string> = {};
  let text: string;
  try {
    text = readFileSync(path, "utf8");
  } catch {
    console.error(`Missing ${path} — expected the saved prod env (cp .env.local .env.prod.local).`);
    process.exit(1);
  }
  for (const line of text.split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (m) out[m[1]] = m[2].replace(/^["']|["']$/g, "");
  }
  return out;
}

const prodEnv = readEnvFile(".env.prod.local");
const prodUrl = prodEnv.NEXT_PUBLIC_SUPABASE_URL;
const prodAnon = prodEnv.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!prodUrl || !prodAnon) {
  console.error(".env.prod.local is missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY.");
  process.exit(1);
}
if (/^https?:\/\/(127\.0\.0\.1|localhost)/.test(prodUrl)) {
  console.error(`.env.prod.local points at a local URL ("${prodUrl}") — expected the cloud project.`);
  process.exit(1);
}

const prod = createClient(prodUrl, prodAnon, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const local = createClient(localUrl, localServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  console.log(`Snapshot: reading content from ${prodUrl}  →  writing to ${localUrl}`);
  for (const table of TABLES) {
    const { data, error } = await prod.from(table).select("*");
    if (error) {
      console.error(`  ${table}: read FAILED — ${error.message}`);
      throw error;
    }
    const rows = data ?? [];
    if (!rows.length) {
      console.log(`  ${table}: (empty)`);
      continue;
    }
    const { error: writeError } = await local.from(table).upsert(rows, { onConflict: "id" });
    if (writeError) {
      console.error(`  ${table}: write FAILED — ${writeError.message}`);
      throw writeError;
    }
    console.log(`  ${table}: ${rows.length}`);
  }
  console.log("Done. (Storage blobs not included — see npm run snapshot:files.)");
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
