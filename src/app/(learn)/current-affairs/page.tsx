import { PageShell } from "@/components/layout/PageShell";
import { CurrentAffairsFeed } from "@/components/current-affairs/CurrentAffairsFeed";
import { getCurrentAffairs } from "@/lib/db/currentAffairs";

export default async function CurrentAffairsPage() {
  const items = await getCurrentAffairs();
  return (
    <PageShell
      title="Current Affairs"
      description="Dated national and international developments, with a foreign-affairs focus. Filter by scope or tag, and bookmark items to revisit."
    >
      <CurrentAffairsFeed items={items} />
    </PageShell>
  );
}
