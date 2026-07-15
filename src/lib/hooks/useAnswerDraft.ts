"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

/**
 * The "your answer" free text for one question, backed by the `answer_drafts`
 * Supabase table (B2). Replaces `useLocalProgress<string>(answerKey(id), "")`.
 *
 * localStorage writes were synchronous per-keystroke; a network write must not
 * be, so writes are debounced (~600ms). Returns `[text, setText]` plus `ready`
 * (derived, so no setState in the effect body) so callers can avoid clobbering
 * the loaded value before it arrives.
 */
const DEBOUNCE_MS = 600;

export function useAnswerDraft(questionId: string) {
  const [text, setText] = useState("");
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load the stored draft on mount / question change (async setState is fine).
  useEffect(() => {
    let active = true;
    createClient()
      .from("answer_drafts")
      .select("body")
      .eq("question_id", questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        setText(data?.body ?? "");
        setLoadedFor(questionId);
      });
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [questionId]);

  const save = useCallback(
    (value: string) => {
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(async () => {
        const supabase = createClient();
        // Upsert's conflict target includes user_id, so PostgREST needs it in the
        // payload — the DB default only fills it on a plain insert.
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("answer_drafts").upsert(
          {
            user_id: user.id,
            question_id: questionId,
            body: value,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "user_id,question_id" },
        );
      }, DEBOUNCE_MS);
    },
    [questionId],
  );

  const update = useCallback(
    (value: string) => {
      setText(value);
      save(value);
    },
    [save],
  );

  return { text, setText: update, ready: loadedFor === questionId };
}
