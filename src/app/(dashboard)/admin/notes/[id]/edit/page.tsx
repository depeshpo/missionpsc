import { NoteEditor } from "@/components/admin/NoteEditor";

export default async function EditNotePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <NoteEditor id={id} />;
}
