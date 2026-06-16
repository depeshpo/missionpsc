import Link from "next/link";
import { Plus, ChevronRight } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { STAGES, papersByStage } from "@/data/syllabus";

export default function AdminSyllabusPage() {
  return (
    <AdminPageShell
      title="Syllabus"
      description="Manage papers, sections and units."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Syllabus" },
      ]}
      actions={
        <Link
          href="/admin/syllabus/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New paper
        </Link>
      }
    >
      <div className="space-y-8">
        {STAGES.map((stage) => {
          const papers = papersByStage(stage.id);
          if (!papers.length) return null;
          return (
            <section key={stage.id} className="space-y-3">
              <div>
                <h2 className="text-sm font-semibold tracking-tight">{stage.title}</h2>
                <p className="text-xs text-muted-foreground">{stage.subtitle}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                {papers.map((p) => {
                  const units = p.sections.reduce((n, s) => n + s.units.length, 0);
                  return (
                    <Link
                      key={p.id}
                      href={`/admin/syllabus/${p.id}`}
                      className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      <Card className="h-full transition-colors hover:border-primary/40 hover:bg-muted/40">
                        <CardContent className="flex h-full items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline">Paper {p.code}</Badge>
                              <span className="text-xs text-muted-foreground">
                                {p.totalMarks} marks
                              </span>
                            </div>
                            <h3 className="mt-1.5 truncate font-semibold tracking-tight">
                              {p.title}
                            </h3>
                            <p className="mt-0.5 text-sm text-muted-foreground">
                              {p.sections.length} sections · {units} units
                            </p>
                          </div>
                          <ChevronRight className="h-4 w-4 shrink-0 text-muted-foreground" />
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>
    </AdminPageShell>
  );
}
