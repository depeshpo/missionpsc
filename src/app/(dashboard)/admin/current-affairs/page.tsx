import Link from "next/link";
import { Plus } from "lucide-react";
import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CurrentAffairsAdminList } from "@/components/admin/CurrentAffairsAdminList";

export default function AdminCurrentAffairsPage() {
  return (
    <AdminPageShell
      title="Current Affairs"
      description="Manage the dated items learners see on the Current Affairs feed."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Current Affairs" },
      ]}
      actions={
        <Link
          href="/admin/current-affairs/new"
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-4 w-4" />
          New item
        </Link>
      }
    >
      <CurrentAffairsAdminList />
    </AdminPageShell>
  );
}
