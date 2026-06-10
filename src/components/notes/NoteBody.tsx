import type { NoteBlock } from "@/lib/types";
import { cn } from "@/lib/cn";

// Heading size by depth (clamped). Anchors offset for comfortable scroll stops.
const HEADING_SIZES = ["text-xl", "text-lg", "text-base", "text-sm"];

export function NoteBody({ blocks }: { blocks: NoteBlock[] }) {
  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === "heading") {
          const size = HEADING_SIZES[Math.min(block.level - 1, HEADING_SIZES.length - 1)];
          return (
            <h2
              key={block.id}
              id={block.id}
              className={cn("scroll-mt-20 font-semibold tracking-tight", size, i > 0 && "pt-2")}
            >
              {block.text}
            </h2>
          );
        }
        if (block.type === "list") {
          return (
            <ul key={i} className="ml-5 list-disc space-y-1.5 text-sm leading-relaxed text-muted-foreground">
              {block.items.map((item, j) => (
                <li key={j}>{item}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i} className="text-sm leading-relaxed text-muted-foreground">
            {block.text}
          </p>
        );
      })}
    </div>
  );
}
