"use client";

import { useEffect, useState } from "react";
import { Download, Eye, EyeOff, FileText } from "lucide-react";
import type { NoteFile } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";
import { getNoteFileBlob } from "@/lib/noteFiles";

const actionLink =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/** Loads a stored file's blob from IndexedDB into an object URL (revoked on cleanup). */
function useFileUrl(ref: string): string | null {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    let objectUrl: string | null = null;
    getNoteFileBlob(ref).then((blob) => {
      if (!active || !blob) return;
      objectUrl = URL.createObjectURL(blob);
      setUrl(objectUrl);
    });
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [ref]);
  return url;
}

function FileRow({ file }: { file: NoteFile }) {
  const url = useFileUrl(file.ref);
  const [open, setOpen] = useState(false);
  const previewable = file.mime === "application/pdf" || file.mime.startsWith("image/");

  return (
    <Card>
      <CardContent className="p-3">
        <div className="flex flex-wrap items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
            <FileText className="h-4 w-4" />
          </span>
          <span className="min-w-0 flex-1 truncate text-sm font-medium">{file.name}</span>
          <div className="flex items-center gap-1">
            {previewable && url ? (
              <button
                type="button"
                onClick={() => setOpen((o) => !o)}
                aria-expanded={open}
                className={actionLink}
              >
                {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                {open ? "Hide" : "Preview"}
              </button>
            ) : null}
            {url ? (
              <a href={url} download={file.name} className={actionLink}>
                <Download className="h-4 w-4" />
                Download
              </a>
            ) : (
              <span className="px-2 py-1 text-xs text-muted-foreground">loading…</span>
            )}
          </div>
        </div>

        {previewable && open && url ? (
          file.mime.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element -- blob object URL, not optimizable by next/image
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
      </CardContent>
    </Card>
  );
}

export function NoteFileList({ files }: { files: NoteFile[] }) {
  return (
    <div className="space-y-2">
      {files.map((f) => (
        <FileRow key={f.id} file={f} />
      ))}
    </div>
  );
}
