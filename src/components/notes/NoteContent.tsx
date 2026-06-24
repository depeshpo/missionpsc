import { ExternalLink } from "lucide-react";
import type { NoteSection } from "@/lib/types";
import { youtubeId, youtubeEmbed } from "@/lib/youtube";
import { NoteFileList } from "./NoteFileList";

/**
 * Renders a note's sections: heading anchor + rich-text HTML + optional YouTube
 * embeds, file attachments, and reference links. HTML is author-trusted (single
 * admin) and rendered directly; sanitise here if notes ever accept untrusted input.
 */
export function NoteContent({ sections }: { sections: NoteSection[] }) {
  return (
    <div className="space-y-10">
      {sections.map((section) => {
        const videos = section.videos
          .map((v) => ({ id: v.id, ytId: youtubeId(v.url) }))
          .filter((v): v is { id: string; ytId: string } => v.ytId !== null);

        return (
          <section key={section.id} className="space-y-4">
            {section.heading ? (
              <h2
                id={section.id}
                className="scroll-mt-20 text-xl font-semibold tracking-tight"
              >
                {section.heading}
              </h2>
            ) : null}

            <div
              className="note-prose text-sm leading-relaxed"
              dangerouslySetInnerHTML={{ __html: section.html }}
            />

            {videos.length ? (
              <div className="space-y-3">
                {videos.map((v) => (
                  <div
                    key={v.id}
                    className="aspect-video w-full overflow-hidden rounded-lg border border-border bg-muted"
                  >
                    <iframe
                      src={youtubeEmbed(v.ytId)}
                      title="YouTube video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="h-full w-full"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {section.files.length ? <NoteFileList files={section.files} /> : null}

            {section.links.length ? (
              <div className="space-y-1.5">
                {section.links.map((l) => (
                  <a
                    key={l.id}
                    href={l.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
                  >
                    <ExternalLink className="h-4 w-4 shrink-0" />
                    {l.title}
                  </a>
                ))}
              </div>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
