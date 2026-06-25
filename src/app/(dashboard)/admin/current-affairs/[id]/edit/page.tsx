import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { CurrentAffairForm } from "@/components/admin/CurrentAffairForm";
import { getCurrentAffairs } from "@/lib/db/currentAffairs";

export default async function EditCurrentAffairPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const items = await getCurrentAffairs();
  return (
    <AdminPageShell
      floatCrumbs
      title="Edit item"
      description="Update this item. Changes show on the public Current Affairs feed."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Current Affairs", href: "/admin/current-affairs" },
        { label: "Edit" },
      ]}
    >
      <CurrentAffairForm id={id} items={items} />
    </AdminPageShell>
  );
}
