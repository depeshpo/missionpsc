import { redirect } from "next/navigation";
import { LogOut, Mail, Monitor } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { ThemeToggle } from "@/components/layout/ThemeToggle";
import { ResetProgressButton } from "@/components/settings/ResetProgressButton";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "@/app/login/actions";

function formatJoined(iso: string | null | undefined) {
  if (!iso) return null;
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "long" }).format(new Date(iso));
}

/** Account, appearance, and per-user study data. */
export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/settings");

  const [{ data: profile }, progress, drafts, bookmarks] = await Promise.all([
    supabase.from("profiles").select("role, created_at").eq("id", user.id).single(),
    supabase.from("user_progress").select("kind").eq("user_id", user.id),
    supabase.from("answer_drafts").select("question_id", { count: "exact", head: true }).eq("user_id", user.id),
    supabase.from("user_bookmarks").select("item_id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  const isAdmin = profile?.role === "admin";
  const joined = formatJoined(profile?.created_at as string | undefined);
  const kinds = (progress.data ?? []).map((r) => r.kind as string);
  const countOf = (kind: string) => kinds.filter((k) => k === kind).length;

  const stats = [
    { label: "Units completed", value: countOf("unit_complete") },
    { label: "Notes read", value: countOf("note_read") },
    { label: "Flashcards known", value: countOf("card_known") },
    { label: "Answers attempted", value: countOf("answer_attempted") },
    { label: "Answer drafts saved", value: drafts.count ?? 0 },
    { label: "Bookmarks", value: bookmarks.count ?? 0 },
  ];
  const hasProgress = stats.some((s) => s.value > 0);

  return (
    <PageShell title="Settings" description="Your account, appearance, and study data.">
      <div className="space-y-4">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Account</CardTitle>
            <CardDescription>You are signed in to Mission PSC.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                  <Mail className="h-5 w-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-medium">{user.email}</p>
                  <p className="text-xs text-muted-foreground">
                    {joined ? `Joined ${joined}` : "Account details"}
                  </p>
                </div>
              </div>
              <Badge variant={isAdmin ? "primary" : "outline"}>{isAdmin ? "Admin" : "User"}</Badge>
            </div>

            <form action={signOut}>
              <Button type="submit" variant="outline">
                <LogOut className="h-4 w-4" />
                Sign out
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>
              Light or dark theme. This is saved per device, not to your account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-accent text-accent-foreground">
                <Monitor className="h-5 w-5" />
              </span>
              <span className="flex-1 text-sm">Theme</span>
              <ThemeToggle />
            </div>
          </CardContent>
        </Card>

        {/* Study data */}
        <Card>
          <CardHeader>
            <CardTitle>Your study data</CardTitle>
            <CardDescription>
              Progress is stored on your account, so it follows you across devices.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-5">
            <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {stats.map((s) => (
                <div key={s.label} className="rounded-lg border border-border px-3 py-2">
                  <dt className="text-xs text-muted-foreground">{s.label}</dt>
                  <dd className="text-xl font-semibold tabular-nums">{s.value}</dd>
                </div>
              ))}
            </dl>

            <div className="border-t border-border pt-4">
              <p className="mb-3 text-sm text-muted-foreground">
                Resetting clears your completed units, read notes, known flashcards, answer drafts
                and bookmarks. Your notes, questions and other content are not affected.
              </p>
              <ResetProgressButton disabled={!hasProgress} />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}
