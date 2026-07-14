/**
 * File attachments for notes, stored in the public `note-files` Supabase Storage
 * bucket. The note row keeps only a `ref` (the object path); the blob lives here.
 *
 * The bucket is public-read (like every content table), so reading a file is just
 * a URL — no fetch, no object URL. Writes are admin-only, enforced by RLS.
 */
import { createClient } from "@/lib/supabase/client";

const BUCKET = "note-files";

/** Keep object paths tame without losing the extension. */
function safeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file"
  );
}

/** Upload a file; returns the storage path to save on the note as `ref`. */
export async function putNoteFile(file: File): Promise<string> {
  const path = `${crypto.randomUUID()}/${safeName(file.name)}`;
  const { error } = await createClient()
    .storage.from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return path;
}

/**
 * Public URL for a stored file. Built from the env URL rather than through a
 * Supabase client, so it stays pure and works during a server render too.
 */
export function noteFileUrl(ref: string): string {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const path = ref.split("/").map(encodeURIComponent).join("/");
  return `${base}/storage/v1/object/public/${BUCKET}/${path}`;
}

/** Delete stored files (best effort — an orphaned blob is harmless). */
export async function deleteNoteFile(...refs: string[]): Promise<void> {
  if (!refs.length) return;
  try {
    await createClient().storage.from(BUCKET).remove(refs);
  } catch {
    // ignore
  }
}
