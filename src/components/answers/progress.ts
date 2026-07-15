import type { ProgressKind } from "@/lib/hooks/useUserProgress";

/** Progress kind for questions with a non-empty answer draft (the DB `user_progress.kind`). */
export const ANSWERS_ATTEMPTED_KEY: ProgressKind = "answer_attempted";
