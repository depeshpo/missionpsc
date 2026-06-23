import { CurrentAffairDetail } from "@/components/current-affairs/CurrentAffairDetail";

export default async function CurrentAffairItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <CurrentAffairDetail id={id} />;
}
