import { ComingSoon } from "@/components/layout/ComingSoon";

export default async function NoteReaderPage({
  params,
}: {
  params: Promise<{ paper: string; unit: string }>;
}) {
  await params;
  return (
    <ComingSoon
      title="Note"
      description="Reading material for a unit, with table of contents."
      breadcrumbs={[{ label: "Notes", href: "/notes" }, { label: "Unit" }]}
    />
  );
}
