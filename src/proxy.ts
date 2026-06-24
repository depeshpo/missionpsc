import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next 16 renamed `middleware` → `proxy` (nodejs runtime, no edge). This refreshes
// the Supabase auth session on every request and gates the /admin surface to admins.
const ADMIN_PREFIX = "/admin";

export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // getUser() validates + refreshes the session token. Keep it right after client
  // creation — do not run other logic between createServerClient and getUser.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname } = request.nextUrl;

  if (pathname.startsWith(ADMIN_PREFIX)) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single();

    if (profile?.role !== "admin") {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?error=${encodeURIComponent("Your account isn’t an admin.")}`;
      return NextResponse.redirect(url);
    }
  }

  return response;
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
