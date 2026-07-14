import Link from "next/link";
import {
  BookOpen,
  FileText,
  PenSquare,
  Layers,
  Newspaper,
  Library,
  ArrowRight,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getPapers } from "@/lib/db/syllabus";
import { getNotes } from "@/lib/db/notes";
import { getQuestions } from "@/lib/db/subjective";
import { getFlashcardsData } from "@/lib/db/flashcards";
import { getCurrentAffairs } from "@/lib/db/currentAffairs";
import { getResources } from "@/lib/db/resources";
import { allUnits, sectionCount } from "@/lib/syllabus";

type ContentType = {
  label: string;
  icon: LucideIcon;
  count: string;
  href?: string;
};

export default async function AdminPage() {
  const [papers, notes, questions, { decks, cards }, currentAffairs, resources] =
    await Promise.all([
      getPapers(),
      getNotes(),
      getQuestions(),
      getFlashcardsData(),
      getCurrentAffairs(),
      getResources(),
    ]);

  const types: ContentType[] = [
    {
      label: "Syllabus",
      icon: BookOpen,
      count: `${papers.length} papers · ${sectionCount(papers)} sections · ${allUnits(papers).length} units`,
      href: "/admin/syllabus",
    },
    {
      label: "Notes",
      icon: FileText,
      count: `${notes.length} notes`,
      href: "/admin/notes",
    },
    {
      label: "Questions",
      icon: PenSquare,
      count: `${questions.length} questions`,
      href: "/admin/questions",
    },
    {
      label: "Flashcards",
      icon: Layers,
      count: `${decks.length} decks · ${cards.length} cards`,
      href: "/admin/flashcards",
    },
    {
      label: "Current Affairs",
      icon: Newspaper,
      count: `${currentAffairs.length} items`,
      href: "/admin/current-affairs",
    },
    {
      label: "Resources",
      icon: Library,
      count: `${resources.length} links`,
      href: "/admin/resources",
    },
  ];

  return (
    <PageShell
      title="Admin"
      description="Author and manage the study content learners see."
    >
      <p className="mb-6 max-w-2xl text-sm text-muted-foreground">
        Pick a content type to manage. Edits are saved to the database and show on
        the study pages straight away.
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {types.map((t) => {
          const Icon = t.icon;
          const inner = (
            <CardContent className="flex h-full flex-col gap-3">
              <div className="flex items-center justify-between">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                {t.href ? (
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <Badge variant="outline">Coming soon</Badge>
                )}
              </div>
              <div>
                <h3 className="font-semibold tracking-tight">{t.label}</h3>
                <p className="mt-0.5 text-sm text-muted-foreground">{t.count}</p>
              </div>
            </CardContent>
          );

          return t.href ? (
            <Link
              key={t.label}
              href={t.href}
              className="rounded-xl outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
                {inner}
              </Card>
            </Link>
          ) : (
            <Card key={t.label} className="h-full opacity-60">
              {inner}
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
