import type { NoteBlock } from "@/lib/types";

/**
 * In-page table of contents built from a note's heading blocks. Indents by the
 * heading `level` relative to the shallowest heading, so any depth nests
 * correctly. Anchor links target the heading `id`s.
 */
export function NoteToc({ blocks }: { blocks: NoteBlock[] }) {
  const headings = blocks.filter((b) => b.type === "heading");
  if (headings.length === 0) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav aria-label="Contents" className="text-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Contents
      </p>
      <ul className="space-y-1">
        {headings.map((h) => (
          <li key={h.id} style={{ paddingLeft: `${(h.level - minLevel) * 0.875}rem` }}>
            <a href={`#${h.id}`} className="text-muted-foreground hover:text-primary">
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
