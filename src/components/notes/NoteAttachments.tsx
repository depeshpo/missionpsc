"use client";

import { useState } from "react";
import { Download, ExternalLink, Eye, EyeOff, FileText, Link2 } from "lucide-react";
import type { NoteAttachment } from "@/lib/types";
import { Card, CardContent } from "@/components/ui/Card";

const actionLink =
  "inline-flex items-center gap-1 rounded-md px-2 py-1 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground";

/**
 * Renders a note's attachments. PDFs get a lazy, expandable inline preview (the
 * iframe is only mounted while open) plus Open/Download; plain links get Open.
 */
export function NoteAttachments({ attachments }: { attachments: NoteAttachment[] }) {
  const [openHref, setOpenHref] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      {attachments.map((att) => {
        const isPdf = att.kind !== "link";
        const open = openHref === att.href;
        const Icon = isPdf ? FileText : Link2;
        return (
          <Card key={att.href}>
            <CardContent className="p-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="min-w-0 flex-1 truncate text-sm font-medium">
                  {att.title}
                </span>
                <div className="flex items-center gap-1">
                  {isPdf ? (
                    <button
                      type="button"
                      onClick={() => setOpenHref(open ? null : att.href)}
                      aria-expanded={open}
                      className={actionLink}
                    >
                      {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      {open ? "Hide" : "Preview"}
                    </button>
                  ) : null}
                  <a
                    href={att.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={actionLink}
                  >
                    <ExternalLink className="h-4 w-4" />
                    Open
                  </a>
                  {isPdf ? (
                    <a href={att.href} download className={actionLink}>
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  ) : null}
                </div>
              </div>

              {isPdf && open ? (
                <div className="mt-3">
                  <iframe
                    src={att.href}
                    title={att.title}
                    className="h-[70vh] w-full rounded-lg border border-border bg-muted"
                  />
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    Preview not loading? Some files refuse to embed — use{" "}
                    <span className="font-medium">Open</span> instead.
                  </p>
                </div>
              ) : null}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
