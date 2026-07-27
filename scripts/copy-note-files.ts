/**
 * Copy note-file blobs from PROD Storage into the LOCAL stack (optional; run after
 * scripts/copy-prod-content.ts so the note_files rows exist locally).
 *
 *   npm run snapshot:files   (= tsx --env-file=.env.local scripts/copy-note-files.ts)
 *
 * Reads each object by its `ref` path from the prod `note-files` bucket (public,
 * anon key) and uploads it into the local bucket (local service-role, upsert).
 * Without this, note metadata is present in dev but attachment downloads 404.
 *
 * SAFETY: refuses to write anywhere but a local URL.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const BUCKET = "note-files";

const localUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const localServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!localUrl || !localServiceKey) {
  console.error("Missing local NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(localUrl)) {
  console.error(`Refusing to write: local target "${localUrl}" is not a local URL (127.0.0.1).`);
  process.exit(1);
}

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

const prod = createClient(prodUrl, prodAnon, {
  auth: { autoRefreshToken: false, persistSession: false },
});
const local = createClient(localUrl, localServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function main() {
  // Get the object paths from the note_files rows (already snapshotted locally).
  const { data: rows, error } = await local.from("note_files").select("ref");
  if (error) throw error;
  const refs = [...new Set((rows ?? []).map((r) => r.ref as string).filter(Boolean))];

  if (!refs.length) {
    console.log("No note_files rows — nothing to copy. (Run snapshot:local first.)");
    return;
  }

  console.log(`Copying ${refs.length} note-file blob(s) from ${prodUrl} → ${localUrl}`);
  let copied = 0;
  let missing = 0;
  for (const ref of refs) {
    const { data: blob, error: dlError } = await prod.storage.from(BUCKET).download(ref);
    if (dlError || !blob) {
      console.warn(`  ! ${ref}: not found in prod (${dlError?.message ?? "no data"})`);
      missing++;
      continue;
    }
    const { error: upError } = await local.storage
      .from(BUCKET)
      .upload(ref, blob, { upsert: true, contentType: blob.type || undefined });
    if (upError) {
      console.warn(`  ! ${ref}: upload failed — ${upError.message}`);
      missing++;
      continue;
    }
    copied++;
  }
  console.log(`Done. copied=${copied}, missing/failed=${missing}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
