"use client";

import { useEffect } from "react";
import { Check, Trash2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { useAnswerDraft } from "@/lib/hooks/useAnswerDraft";
import { ANSWERS_ATTEMPTED_KEY } from "./progress";

function wordCount(text: string) {
  const t = text.trim();
  return t ? t.split(/\s+/).length : 0;
}

/**
 * Autosaving "your answer" textarea backed by localStorage, with a live word
 * count vs the target and a clear button. Keeps the shared attempted-set in
 * sync so paper/index counts reflect progress.
 */
export function AnswerEditor({
  questionId,
  wordTarget,
}: {
  questionId: string;
  wordTarget?: number;
}) {
  const { text, setText, ready } = useAnswerDraft(questionId);
  const { has, toggle } = useUserIdSet(ANSWERS_ATTEMPTED_KEY);

  // Mirror "has written something" into the attempted set. Wait for the draft to
  // load so an empty pre-load value doesn't wrongly clear the attempted flag.
  useEffect(() => {
    if (!ready) return;
    const attempted = text.trim().length > 0;
    if (attempted !== has(questionId)) toggle(questionId);
  }, [ready, text, questionId, has, toggle]);

  const words = wordCount(text);
  const saved = text.length > 0;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label htmlFor="answer" className="text-sm font-medium">
          Your answer
        </label>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            saved ? "text-success" : "text-muted-foreground",
          )}
        >
          {saved ? <Check className="h-3.5 w-3.5" /> : null}
          {saved ? "Saved" : "Not started"}
        </span>
      </div>
      <textarea
        id="answer"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Draft your answer here — it autosaves to your account."
        className="min-h-64 w-full resize-y rounded-lg border border-border bg-card p-3 text-sm leading-relaxed outline-none focus-visible:ring-2 focus-visible:ring-ring"
      />
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {words} word{words === 1 ? "" : "s"}
          {wordTarget ? ` · target ~${wordTarget}` : ""}
        </span>
        {saved ? (
          <button
            type="button"
            onClick={() => setText("")}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
