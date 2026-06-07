import { Search } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";

export function Topbar() {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/80 px-6 backdrop-blur">
      <div className="flex flex-1 items-center">
        <div className="flex h-9 w-full max-w-md items-center gap-2 rounded-lg border border-border bg-card px-3 text-sm text-muted-foreground">
          <Search className="h-4 w-4" />
          <span>Search syllabus, questions, notes…</span>
        </div>
      </div>
      <ThemeToggle />
      <span className="grid h-9 w-9 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground">
        DP
      </span>
    </header>
  );
}
