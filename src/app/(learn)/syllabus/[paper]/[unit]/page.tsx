import Link from "next/link";
import { notFound } from "next/navigation";
import { BookOpen, Layers, PenLine, ArrowRight } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getUnit } from "@/data/syllabus";
import { UnitCheckbox } from "@/components/syllabus/UnitCheckbox";

export default async function SyllabusUnitPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  const { paper: paperId, unit: unitId } = await params;
  const found = getUnit(unitId);
  if (!found || found.paper.id !== paperId) notFound();

  const { paper, section, unit } = found;

  const studyLinks = [
    { href: `/notes/${paper.id}/${unit.id}`, label: "Read notes", icon: BookOpen },
    { href: `/answers/${paper.id}`, label: "Practice answers", icon: PenLine },
    { href: "/flashcards", label: "Flashcards", icon: Layers },
  ];

  return (
    <PageShell
      title={`${unit.number !== "—" ? `Unit ${unit.number} — ` : ""}${unit.title}`}
      description={section.label}
      breadcrumbs={[
        { label: "Syllabus", href: "/syllabus" },
        { label: `Paper ${paper.code}`, href: `/syllabus/${paper.id}` },
        { label: unit.title },
      ]}
      actions={<UnitCheckbox unitId={unit.id} label="Mark complete" />}
    >
      <div className="space-y-6">
        <Card>
          <CardContent className="space-y-3">
            <Badge variant="outline">{section.marks} marks · {section.label.split(" — ")[0]}</Badge>
            <ul className="space-y-2">
              {unit.subtopics.map((sub, i) => (
                <li key={i} className="flex gap-3 text-sm">
                  <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-xs font-medium text-accent-foreground tabular-nums">
                    {i + 1}
                  </span>
                  <span>{sub}</span>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <div>
          <h2 className="mb-3 text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Study this unit
          </h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {studyLinks.map((s) => {
              const Icon = s.icon;
              return (
                <Link key={s.label} href={s.href}>
                  <Card className="transition-colors hover:border-primary/40">
                    <CardContent className="flex items-center gap-3">
                      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                        <Icon className="h-4 w-4" />
                      </span>
                      <span className="flex-1 text-sm font-medium">{s.label}</span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground" />
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            Notes, answer practice and flashcards arrive as those features are built.
          </p>
        </div>
      </div>
    </PageShell>
  );
}
