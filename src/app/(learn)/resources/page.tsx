import { PageShell } from "@/components/layout/PageShell";
import { ResourcesList } from "@/components/resources/ResourcesList";
import { getResources } from "@/lib/db/resources";

export default async function ResourcesPage() {
  const resources = await getResources();
  return (
    <PageShell
      title="Resources"
      description="Curated links: the Constitution and Acts, treaties, Vienna Conventions, government and MoFA portals, organizations, and references. Search, filter, and bookmark."
    >
      <ResourcesList resources={resources} />
    </PageShell>
  );
}
