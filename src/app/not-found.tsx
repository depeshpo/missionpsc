import Link from "next/link";
import { FileQuestion, ArrowLeft } from "lucide-react";

/**
 * 404 — shown for unmatched URLs and whenever a route calls `notFound()`
 * (bogus paper/unit/note/question ids all land here). Root-level, so it renders
 * for both the learn and dashboard surfaces; it keeps its own centred layout
 * rather than assuming either shell.
 */
export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center px-6 py-16">
      <div className="w-full max-w-md text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-2xl bg-accent text-accent-foreground">
          <FileQuestion className="h-7 w-7" />
        </div>
        <p className="text-sm font-medium text-muted-foreground">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Page not found</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          That page doesn&apos;t exist, or the content it pointed to has been removed.
        </p>
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/dashboard"
            className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition-colors hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to dashboard
          </Link>
          <Link
            href="/syllabus"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            Browse the syllabus
          </Link>
        </div>
      </div>
    </main>
  );
}
