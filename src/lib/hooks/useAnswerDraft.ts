"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AnswerFile } from "@/lib/types";
import { createClient } from "@/lib/supabase/client";

/**
 * One question's practice-answer draft, backed by the `answer_drafts` Supabase
 * table (B2). `body` holds the rich-text HTML; `attachments` is the jsonb list of
 * uploaded files (blobs live in the private `answer-files` bucket, see
 * `@/lib/answerFiles`).
 *
 * Body edits are debounced (~600ms) — a network write per keystroke would be
 * wasteful. Attachment changes persist promptly (the blob is already uploaded, so
 * we just want the metadata saved). `ready` (derived, so no setState in an effect)
 * lets callers avoid clobbering the loaded value before it arrives.
 */
const DEBOUNCE_MS = 600;

export function useAnswerDraft(questionId: string) {
  const [html, setHtmlState] = useState("");
  const [attachments, setAttachmentsState] = useState<AnswerFile[]>([]);
  const [loadedFor, setLoadedFor] = useState<string | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Newest values, read at flush time so a debounced body save and a prompt
  // attachment save never write each other's stale copy.
  const latest = useRef<{ html: string; attachments: AnswerFile[] }>({
    html: "",
    attachments: [],
  });

  // Load the stored draft on mount / question change (async setState is fine).
  useEffect(() => {
    let active = true;
    createClient()
      .from("answer_drafts")
      .select("body, attachments")
      .eq("question_id", questionId)
      .maybeSingle()
      .then(({ data }) => {
        if (!active) return;
        const body = data?.body ?? "";
        const files = (data?.attachments as AnswerFile[] | null) ?? [];
        setHtmlState(body);
        setAttachmentsState(files);
        latest.current = { html: body, attachments: files };
        setLoadedFor(questionId);
      });
    return () => {
      active = false;
      if (timer.current) clearTimeout(timer.current);
    };
  }, [questionId]);

  const persist = useCallback(async () => {
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
        body: latest.current.html,
        attachments: latest.current.attachments,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,question_id" },
    );
  }, [questionId]);

  const setHtml = useCallback(
    (value: string) => {
      setHtmlState(value);
      latest.current = { ...latest.current, html: value };
      if (timer.current) clearTimeout(timer.current);
      timer.current = setTimeout(() => void persist(), DEBOUNCE_MS);
    },
    [persist],
  );

  const setAttachments = useCallback(
    (value: AnswerFile[]) => {
      setAttachmentsState(value);
      latest.current = { ...latest.current, attachments: value };
      // The blob is already uploaded; save the metadata now rather than debounced,
      // so navigating away immediately doesn't drop the attachment.
      if (timer.current) clearTimeout(timer.current);
      void persist();
    },
    [persist],
  );

  return {
    html,
    setHtml,
    attachments,
    setAttachments,
    ready: loadedFor === questionId,
  };
}
