import type { NoteSection } from "@/lib/types";

/**
 * In-page table of contents built from a note's section headings. Each section
 * is one entry; anchor links target the section `id`s.
 */
export function NoteToc({ sections }: { sections: NoteSection[] }) {
  const entries = sections.filter((s) => s.heading.trim() !== "");
  if (entries.length === 0) return null;

  return (
    <nav aria-label="Contents" className="text-sm">
      <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Contents
      </p>
      <ul className="space-y-1">
        {entries.map((s) => (
          <li key={s.id}>
            <a href={`#${s.id}`} className="text-muted-foreground hover:text-primary">
              {s.heading}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
