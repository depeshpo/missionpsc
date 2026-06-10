import { LearnHeader } from "@/components/layout/LearnHeader";

// Learn surface: the public landing page + reading/study pages. A slim top
// header instead of the Dashboard sidebar. Account/progress/admin live under
// the (dashboard) group.
export default function LearnLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex h-screen flex-col overflow-hidden">
      <LearnHeader />
      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
