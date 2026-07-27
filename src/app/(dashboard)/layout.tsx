import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Sidebar } from "@/components/layout/Sidebar";
import { SIDEBAR_COOKIE } from "@/components/layout/nav";
import { Topbar } from "@/components/layout/Topbar";
import { createClient } from "@/lib/supabase/server";

// App shell for the Dashboard surface: account, progress, and admin content
// authoring. The whole surface requires login (proxy enforces it; this also
// redirects as defence-in-depth) and the Admin nav shows only to admins.
export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?redirect=/dashboard");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = profile?.role === "admin";
  // Sidebar width is a UI preference kept in a cookie, so the server renders it
  // already collapsed/expanded — no flash, no hydration mismatch.
  const collapsed = (await cookies()).get(SIDEBAR_COOKIE)?.value === "1";

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar className="hidden md:flex" isAdmin={isAdmin} defaultCollapsed={collapsed} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar isAdmin={isAdmin} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  );
}
