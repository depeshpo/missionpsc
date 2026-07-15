import type { ProgressKind } from "@/lib/hooks/useUserProgress";

/** Progress kind for units whose note is marked read (the DB `user_progress.kind`). */
export const NOTES_READ_KEY: ProgressKind = "note_read";
