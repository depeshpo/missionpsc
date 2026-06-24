import { AdminPageShell } from "@/components/admin/AdminPageShell";
import { PaperForm } from "@/components/admin/PaperForm";

export default function NewPaperPage() {
  return (
    <AdminPageShell
      floatCrumbs
      title="New paper"
      description="Add a paper with its sections and units."
      breadcrumbs={[
        { label: "Admin", href: "/admin" },
        { label: "Syllabus", href: "/admin/syllabus" },
        { label: "New" },
      ]}
    >
      <PaperForm />
    </AdminPageShell>
  );
}
