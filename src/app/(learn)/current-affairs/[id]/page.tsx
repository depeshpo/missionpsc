import { notFound } from "next/navigation";
import { ExternalLink } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Badge } from "@/components/ui/Badge";
import { getCurrentAffair, formatDate } from "@/data/currentAffairs";
import { BookmarkButton } from "@/components/current-affairs/BookmarkButton";

export default async function CurrentAffairItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = getCurrentAffair(id);
  if (!item) notFound();

  return (
    <PageShell
      title={item.title}
      breadcrumbs={[
        { label: "Current Affairs", href: "/current-affairs" },
        { label: item.title },
      ]}
      actions={<BookmarkButton id={item.id} labeled />}
    >
      <div className="max-w-2xl space-y-5">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={item.scope === "international" ? "primary" : "outline"}>
            {item.scope}
          </Badge>
          <span className="text-sm text-muted-foreground">{formatDate(item.date)}</span>
        </div>

        <p className="text-base leading-relaxed">{item.summary}</p>

        {item.body?.length ? (
          <div className="space-y-4">
            {item.body.map((para, i) => (
              <p key={i} className="text-sm leading-relaxed text-muted-foreground">
                {para}
              </p>
            ))}
          </div>
        ) : null}

        {item.tags?.length ? (
          <div className="flex flex-wrap gap-1.5">
            {item.tags.map((t) => (
              <Badge key={t} variant="default">
                {t}
              </Badge>
            ))}
          </div>
        ) : null}

        {item.source ? (
          <a
            href={item.source.href}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:opacity-80"
          >
            <ExternalLink className="h-4 w-4" />
            Source: {item.source.title}
          </a>
        ) : null}
      </div>
    </PageShell>
  );
}
