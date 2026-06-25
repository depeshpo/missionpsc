import { notFound } from "next/navigation";
import { CurrentAffairDetail } from "@/components/current-affairs/CurrentAffairDetail";
import { getCurrentAffair } from "@/lib/db/currentAffairs";

export default async function CurrentAffairItemPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const item = await getCurrentAffair(id);
  if (!item) notFound();
  return <CurrentAffairDetail item={item} />;
}
