/**
 * File attachments for practice-answer drafts, stored in the PRIVATE `answer-files`
 * Supabase Storage bucket. The draft row keeps only the metadata (name/mime/size +
 * `ref`, the object path); the blob lives here.
 *
 * Unlike note-files (public content), these are the student's own private work, so
 * the bucket is private: objects are keyed `<uid>/<question_id>/<file>`, storage
 * RLS scopes every read/write to the owner's own `<uid>/` prefix, and reads go
 * through short-lived signed URLs (free + unlimited — only the storage/egress/size
 * free-tier caps matter).
 */
import { createClient } from "@/lib/supabase/client";

const BUCKET = "answer-files";
const SIGNED_URL_TTL = 60 * 60; // 1 hour — long enough for a study session.

/** Keep object path segments tame without losing the extension. */
function safeName(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9.\-_]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80) || "file"
  );
}

/**
 * Upload a file under the signed-in user's own prefix; returns the storage path to
 * save on the draft as `ref`. Throws if signed out or the upload fails (RLS, size).
 */
export async function putAnswerFile(questionId: string, file: File): Promise<string> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("You are not signed in.");

  // First path segment MUST be the uid — storage RLS keys ownership off it.
  const path = `${user.id}/${safeName(questionId)}/${crypto.randomUUID()}-${safeName(file.name)}`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { contentType: file.type || "application/octet-stream" });
  if (error) throw error;
  return path;
}

/** A short-lived signed URL to read a private attachment (preview/download). */
export async function answerFileUrl(ref: string): Promise<string> {
  const { data, error } = await createClient()
    .storage.from(BUCKET)
    .createSignedUrl(ref, SIGNED_URL_TTL);
  if (error) throw error;
  return data.signedUrl;
}

/** Delete stored files (best effort — an orphaned blob is harmless). */
export async function deleteAnswerFiles(...refs: string[]): Promise<void> {
  if (!refs.length) return;
  try {
    await createClient().storage.from(BUCKET).remove(refs);
  } catch {
    // ignore
  }
}
