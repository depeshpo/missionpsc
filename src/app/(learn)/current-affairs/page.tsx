import { PageShell } from "@/components/layout/PageShell";
import { currentAffairs, allTags } from "@/data/currentAffairs";
import { CurrentAffairsFeed } from "@/components/current-affairs/CurrentAffairsFeed";

export default function CurrentAffairsPage() {
  return (
    <PageShell
      title="Current Affairs"
      description="Dated national and international developments, with a foreign-affairs focus. Filter by scope or tag, and bookmark items to revisit."
    >
      <CurrentAffairsFeed items={currentAffairs} tags={allTags()} />
    </PageShell>
  );
}
