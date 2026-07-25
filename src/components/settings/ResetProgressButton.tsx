"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { clearUserStateCaches } from "@/lib/hooks/useUserProgress";
import { resetProgress } from "@/app/(dashboard)/settings/actions";
import { toast } from "@/lib/toast";

/**
 * Wipes the user's progress after an explicit confirm. Clears the shared client
 * caches too, so ticks disappear across the app without needing a reload.
 */
export function ResetProgressButton({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleReset() {
    if (
      !window.confirm(
        "Reset all your study progress?\n\nThis erases your completed units, read notes, known flashcards, answer drafts and bookmarks. Your notes, questions and other authored content are not affected. This cannot be undone.",
      )
    )
      return;

    setBusy(true);
    setError(null);
    const res = await resetProgress();
    if ("error" in res) {
      setError(res.error);
      toast.error(res.error);
      setBusy(false);
      return;
    }
    clearUserStateCaches();
    setBusy(false);
    toast.success("Progress reset");
    router.refresh();
  }

  return (
    <div className="space-y-2">
      <Button variant="outline" onClick={handleReset} disabled={busy || disabled}>
        <RotateCcw className="h-4 w-4" />
        {busy ? "Resetting…" : "Reset my progress"}
      </Button>
      {error ? <p className="text-sm text-warning">{error}</p> : null}
    </div>
  );
}
