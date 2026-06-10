"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";

/**
 * Collapsible model answer / template, hidden by default so you can attempt the
 * question before peeking.
 */
export function ModelAnswer({
  text,
  label = "Model answer",
}: {
  text: string;
  label?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:opacity-80"
      >
        {open ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        {open ? `Hide ${label.toLowerCase()}` : `Reveal ${label.toLowerCase()}`}
      </button>
      {open ? (
        <Card>
          <CardContent className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
            {text}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
