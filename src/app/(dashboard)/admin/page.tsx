import { ComingSoon } from "@/components/layout/ComingSoon";

export default function AdminPage() {
  return (
    <ComingSoon
      title="Admin"
      description="Content authoring & management."
      note="The admin surface — authoring notes, subjective questions, model answers and flashcards, plus an AI-assisted content seeder for genuine, sourced material — arrives in a successive version. Until then content is hand-authored in src/data/*.ts."
    />
  );
}
