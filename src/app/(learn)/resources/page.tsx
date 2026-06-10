import { PageShell } from "@/components/layout/PageShell";
import { resources, categories } from "@/data/resources";
import { ResourcesList } from "@/components/resources/ResourcesList";

export default function ResourcesPage() {
  return (
    <PageShell
      title="Resources"
      description="Curated links: the Constitution and Acts, treaties, Vienna Conventions, government and MoFA portals, organizations, and references. Search, filter, and bookmark."
    >
      <ResourcesList resources={resources} categories={categories()} />
    </PageShell>
  );
}
