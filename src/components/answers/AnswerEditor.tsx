"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Download, Eye, EyeOff, FileText, Trash2, Upload } from "lucide-react";
import type { AnswerFile } from "@/lib/types";
import { cn } from "@/lib/cn";
import { useUserIdSet } from "@/lib/hooks/useUserProgress";
import { useAnswerDraft } from "@/lib/hooks/useAnswerDraft";
import { putAnswerFile, deleteAnswerFiles, answerFileUrl } from "@/lib/answerFiles";
import { RichTextEditor } from "@/components/admin/RichTextEditor";
import { Skeleton } from "@/components/ui/Skeleton";
import { ANSWERS_ATTEMPTED_KEY } from "./progress";

/** Plain text out of the editor HTML, for the word count and "started" check. */
function htmlText(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wordCount(text: string) {
  return text ? text.split(/\s+/).length : 0;
}

/**
 * Autosaving "your answer" editor backed by the `answer_drafts` table. Rich text
 * (contentEditable via {@link RichTextEditor}) plus private file attachments, a
 * live word count vs the target, and a clear button. Keeps the shared attempted-set
 * in sync so paper/index counts reflect progress.
 */
export function AnswerEditor({
  questionId,
  wordTarget,
}: {
  questionId: string;
  wordTarget?: number;
}) {
  const { html, setHtml, attachments, setAttachments, ready } = useAnswerDraft(questionId);
  const { has, toggle } = useUserIdSet(ANSWERS_ATTEMPTED_KEY);

  // RichTextEditor is uncontrolled (seeds initialHtml once on mount), so it must
  // only mount after the draft loads, and remount to reflect a programmatic clear.
  const [editorNonce, setEditorNonce] = useState(0);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const plain = htmlText(html);
  const words = wordCount(plain);
  const attempted = plain.length > 0 || attachments.length > 0;

  // Mirror "has written / attached something" into the attempted set. Wait for the
  // draft to load so an empty pre-load value doesn't wrongly clear the flag.
  useEffect(() => {
    if (!ready) return;
    if (attempted !== has(questionId)) toggle(questionId);
  }, [ready, attempted, questionId, has, toggle]);

  async function handleFiles(list: FileList | null) {
    if (!list || list.length === 0) return;
    setUploading(true);
    setUploadError(null);

    const added: AnswerFile[] = [];
    for (const file of Array.from(list)) {
      try {
        const ref = await putAnswerFile(questionId, file);
        added.push({
          id: crypto.randomUUID(),
          name: file.name,
          mime: file.type || "application/octet-stream",
          size: file.size,
          ref,
        });
      } catch (err) {
        setUploadError(
          `Couldn't upload ${file.name}: ${err instanceof Error ? err.message : "upload failed"}`,
        );
      }
    }

    setUploading(false);
    if (added.length) setAttachments([...attachments, ...added]);
  }

  function removeFile(file: AnswerFile) {
    void deleteAnswerFiles(file.ref);
    setAttachments(attachments.filter((f) => f.id !== file.id));
  }

  function clearBody() {
    setHtml("");
    setEditorNonce((n) => n + 1); // remount the editor so its DOM empties too
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">Your answer</label>
        <span
          className={cn(
            "inline-flex items-center gap-1 text-xs",
            attempted ? "text-success" : "text-muted-foreground",
          )}
        >
          {attempted ? <Check className="h-3.5 w-3.5" /> : null}
          {attempted ? "Saved" : "Not started"}
        </span>
      </div>

      {ready ? (
        <RichTextEditor
          key={`${questionId}:${editorNonce}`}
          initialHtml={html}
          onChange={setHtml}
          placeholder="Draft your answer here — it autosaves to your account."
        />
      ) : (
        <Skeleton className="h-64 w-full rounded-lg" />
      )}

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="tabular-nums">
          {words} word{words === 1 ? "" : "s"}
          {wordTarget ? ` · target ~${wordTarget}` : ""}
        </span>
        {plain.length > 0 ? (
          <button
            type="button"
            onClick={clearBody}
            className="inline-flex items-center gap-1 hover:text-foreground"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Clear
          </button>
        ) : null}
      </div>

      {/* Attachments */}
      <div className="rounded-lg border border-dashed border-border p-3">
        <div className="mb-2 flex items-center gap-2">
          <FileText className="h-4 w-4 text-muted-foreground" />
          <span className="text-xs font-medium">
            Attachments <span className="text-muted-foreground">({attachments.length})</span>
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="ml-auto inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload
          </button>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            className="hidden"
            onChange={(e) => {
              void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>

        {uploading ? <p className="mb-2 text-xs text-muted-foreground">Uploading…</p> : null}
        {uploadError ? <p className="mb-2 text-xs text-warning">{uploadError}</p> : null}

        {attachments.length === 0 ? (
          <p className="text-xs text-muted-foreground">
            Attach scanned handwriting, a PDF, or reference images — private to your account.
          </p>
        ) : (
          <div className="space-y-2">
            {attachments.map((f) => (
              <AttachmentRow key={f.id} file={f} onRemove={() => removeFile(f)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const actionLink =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * One attachment. The bucket is private, so preview/download resolve a short-lived
 * signed URL on demand (cached after the first fetch).
 */
function AttachmentRow({ file, onRemove }: { file: AnswerFile; onRemove: () => void }) {
  const [url, setUrl] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const previewable = file.mime === "application/pdf" || file.mime.startsWith("image/");

  async function ensureUrl(): Promise<string | null> {
    if (url) return url;
    try {
      const u = await answerFileUrl(file.ref);
      setUrl(u);
      return u;
    } catch {
      setError("Couldn't open this file.");
      return null;
    }
  }

  async function download() {
    const u = await ensureUrl();
    if (!u) return;
    const a = document.createElement("a");
    a.href = u;
    a.download = file.name;
    a.target = "_blank";
    a.rel = "noopener";
    a.click();
  }

  async function togglePreview() {
    if (!open && !(await ensureUrl())) return;
    setOpen((o) => !o);
  }

  return (
    <div className="rounded-lg border border-border bg-card p-3">
      <div className="flex flex-wrap items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
          <FileText className="h-4 w-4" />
        </span>
        <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
        <span className="shrink-0 text-xs text-muted-foreground">
          {(file.size / 1024).toFixed(0)} KB
        </span>
        <div className="flex items-center gap-1">
          {previewable ? (
            <button type="button" onClick={togglePreview} aria-expanded={open} className={actionLink}>
              {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {open ? "Hide" : "Preview"}
            </button>
          ) : null}
          <button type="button" onClick={download} className={actionLink}>
            <Download className="h-4 w-4" />
            Download
          </button>
          <button
            type="button"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
            className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-warning"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {error ? <p className="mt-2 text-xs text-warning">{error}</p> : null}

      {previewable && open && url ? (
        file.mime.startsWith("image/") ? (
          // eslint-disable-next-line @next/next/no-img-element -- signed storage URL, not optimizable by next/image
          <img
            src={url}
            alt={file.name}
            className="mt-3 max-h-[70vh] w-full rounded-lg border border-border object-contain"
          />
        ) : (
          <iframe
            src={url}
            title={file.name}
            className="mt-3 h-[70vh] w-full rounded-lg border border-border bg-muted"
          />
        )
      ) : null}
    </div>
  );
}
