import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { QuestionsAdminList } from "@/components/admin/QuestionsAdminList";

export default function AdminQuestionsPage() {
  return (
    <AdminPageShell
      title="Questions"
      description="Manage the subjective answer-writing bank learners practise on."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Questions" },
      ]}
      actions={
        <Link
          href="/admin/questions/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New question
        </Link>
      }
    >
      <QuestionsAdminList />
    </AdminPageShell>
  );
}
