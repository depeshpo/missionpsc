import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default function NewResourcePage() {
  return (
    <AdminPageShell
      floatCrumbs
      title="New resource"
      description="Add a curated link to the Resources page."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Resources", href: "/admin/resources" },
        { label: "New" },
      ]}
    >
      <ResourceForm />
    </AdminPageShell>
  );
}
