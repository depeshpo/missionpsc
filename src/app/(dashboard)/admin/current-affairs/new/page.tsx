import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CurrentAffairForm } from "@/components/admin/CurrentAffairForm";
import { getCurrentAffairs } from "@/lib/db/currentAffairs";

export default async function NewCurrentAffairPage() {
  // Default the date to today (server-side is fine — no client purity rule here).
  const today = new Date().toISOString().slice(0, 10);
  const items = await getCurrentAffairs();
  return (
    <AdminPageShell
      floatCrumbs
      title="New item"
      description="Add a dated item to the Current Affairs feed."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Current Affairs", href: "/admin/current-affairs" },
        { label: "New" },
      ]}
    >
      <CurrentAffairForm items={items} defaultDate={today} />
    </AdminPageShell>
  );
}
