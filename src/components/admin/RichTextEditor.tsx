"use client";

import { useEffect, useRef } from "react";
import { Bold, Italic, List, ListOrdered, Heading2, Heading3, Link2 } from "lucide-react";
import { cn } from "@/lib/cn";

/** Toolbar button. */
function ToolBtn({
  onClick,
  label,
  children,
}: {
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Keep focus/selection in the editable area when clicking the toolbar.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      title={label}
      className="grid h-8 w-8 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
    >
      {children}
    </button>
  );
}

/**
 * Minimal hand-rolled rich-text editor (no dependency). contentEditable + a small
 * toolbar via document.execCommand; stores HTML. Uncontrolled — the initial HTML
 * is written once, edits are reported through `onChange` (so the caret never jumps).
 * One instance per section (key by section id) to load the right initial value.
 */
export function RichTextEditor({
  initialHtml,
  onChange,
  placeholder = "Write the note…",
}: {
  initialHtml: string;
  onChange: (html: string) => void;
  placeholder?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  // Seed the editable DOM once on mount (a DOM write, not React state).
  useEffect(() => {
    if (ref.current) ref.current.innerHTML = initialHtml;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function exec(command: string, value?: string) {
    document.execCommand(command, false, value);
    if (ref.current) onChange(ref.current.innerHTML);
  }

  function addLink() {
    const url = window.prompt("Link URL");
    if (url) exec("createLink", url);
  }

  return (
    <div className="rounded-lg border border-border bg-background">
      <div className="flex flex-wrap items-center gap-0.5 border-b border-border px-1.5 py-1">
        <ToolBtn label="Bold" onClick={() => exec("bold")}>
          <Bold className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Italic" onClick={() => exec("italic")}>
          <Italic className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolBtn label="Heading 2" onClick={() => exec("formatBlock", "H2")}>
          <Heading2 className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Heading 3" onClick={() => exec("formatBlock", "H3")}>
          <Heading3 className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolBtn label="Bullet list" onClick={() => exec("insertUnorderedList")}>
          <List className="h-4 w-4" />
        </ToolBtn>
        <ToolBtn label="Numbered list" onClick={() => exec("insertOrderedList")}>
          <ListOrdered className="h-4 w-4" />
        </ToolBtn>
        <span className="mx-1 h-5 w-px bg-border" />
        <ToolBtn label="Add link" onClick={addLink}>
          <Link2 className="h-4 w-4" />
        </ToolBtn>
      </div>
      <div
        ref={ref}
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline="true"
        data-placeholder={placeholder}
        onInput={(e) => onChange((e.target as HTMLDivElement).innerHTML)}
        className={cn(
          "note-prose min-h-28 px-3 py-2 text-sm leading-relaxed outline-none",
          "empty:before:text-muted-foreground empty:before:content-[attr(data-placeholder)]",
        )}
      />
    </div>
  );
}
