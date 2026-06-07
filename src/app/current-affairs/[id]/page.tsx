import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function CurrentAffairItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Current affair"
      description="A single dated item."
      breadcrumbs={[{ label: "Current Affairs", href: "/current-affairs" }, { label: "Item" }]}
    />
  );
}
