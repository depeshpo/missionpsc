import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { Card, CardContent } from "@/components/ui/Card";
import { getUnit } from "@/data/syllabus";
import { getNoteByUnit } from "@/data/notes";
import { MarkReadButton } from "@/components/notes/MarkReadButton";
import { NoteToc } from "@/components/notes/NoteToc";
import { NoteBody } from "@/components/notes/NoteBody";
import { NoteAttachments } from "@/components/notes/NoteAttachments";

export default async function NoteReaderPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const found = getUnit(unitId);
  const note = getNoteByUnit(unitId);
  if (!found || !note || found.paper.id !== paperId) notFound();

  const { paper, unit } = found;

  return (
    <article>
      <Breadcrumbs
        items={[
          { label: "Notes", href: "/notes" },
          { label: `Paper ${paper.code}`, href: `/notes/${paper.id}` },
          { label: unit.title },
        ]}
      />
      <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
        <h1 className="text-2xl font-semibold tracking-tight">{note.title}</h1>
        <MarkReadButton unitId={unit.id} />
      </div>

      <Card className="mt-6">
        <CardContent>
          <NoteToc blocks={note.body} />
        </CardContent>
      </Card>

      <div className="mt-6">
        <NoteBody blocks={note.body} />
      </div>

      {note.attachments?.length ? (
        <section className="mt-8">
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Sources &amp; attachments
          </h2>
          <NoteAttachments attachments={note.attachments} />
        </section>
      ) : null}
    </article>
  );
}
