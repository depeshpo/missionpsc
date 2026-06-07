import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function FlashcardDeckPage({
  params,
}: {
  params: Promise<{ deck: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Review session"
      description="Flip cards and mark know/again."
      breadcrumbs={[{ label: "Flashcards", href: "/flashcards" }, { label: "Deck" }]}
    />
  );
}
