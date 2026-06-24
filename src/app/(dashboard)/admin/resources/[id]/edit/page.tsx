import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { ResourceForm } from "@/components/admin/ResourceForm";

export default async function EditResourcePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <AdminPageShell
      floatCrumbs
      title="Edit resource"
      description="Update this link. Changes show on the public Resources page."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Resources", href: "/admin/resources" },
        { label: "Edit" },
      ]}
    >
      <ResourceForm id={id} />
    </AdminPageShell>
  );
}
