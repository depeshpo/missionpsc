import { NextResponse, type NextRequest } from "next/server";
import { createServerClient } from "@supabase/ssr";

// Next 16 renamed `middleware` → `proxy` (nodejs runtime, no edge). This refreshes
// the Supabase auth session on every request and gates the whole app: every route
// requires a logged-in user except the allow-list below, and /admin additionally
// requires the admin role. (Per-user progress lives on the learn pages now, so
// they need a user too — the landing page stays open as the sign-in entry point.)
//
// It also mints a per-request CSP nonce here (see buildCsp): the nonce goes on the
// request headers so Next auto-applies it to its own scripts during SSR, and on the
// `x-nonce` header so the root layout can put it on our one inline theme script.
const PUBLIC_PATHS = ["/", "/login"];
const ADMIN_PREFIX = "/admin";

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(prefix + "/");
}

/**
 * Build the Content-Security-Policy for this request. The nonce lets exactly our
 * scripts run (Next's bundles + the theme-init inline script); `strict-dynamic`
 * lets the nonce'd loader pull the rest. Origins are derived from the Supabase URL
 * so the policy stays correct across environments.
 *
 * - `style-src 'unsafe-inline'`: Tailwind v4 + next/font + React inline `style`
 *   attributes need it, and nonces don't cover inline style *attributes*. Styles
 *   are low XSS risk — script-src is the real guard.
 * - dev only: `'unsafe-eval'` (React dev uses eval) and `ws:` (HMR socket); no
 *   `upgrade-insecure-requests` (it would break http://localhost).
 */
function buildCsp(nonce: string): string {
  const isDev = process.env.NODE_ENV === "development";

  let supabaseOrigin = "";
  try {
    supabaseOrigin = new URL(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").origin;
  } catch {
    // Left blank if unset/invalid; connect-src falls back to 'self'.
  }
  const supabaseWs = supabaseOrigin.replace(/^https:/, "wss:");

  const scriptSrc = [
    "'self'",
    `'nonce-${nonce}'`,
    "'strict-dynamic'",
    isDev ? "'unsafe-eval'" : "",
  ]
    .filter(Boolean)
    .join(" ");

  const connectSrc = ["'self'", supabaseOrigin, supabaseWs, isDev ? "ws:" : ""]
    .filter(Boolean)
    .join(" ");

  // PDF attachments preview in an <iframe> served from Supabase Storage (signed
  // URLs for answer files, public URLs for note files), so the bucket origin must
  // be allowed to frame — alongside the YouTube embeds.
  const frameSrc = ["'self'", supabaseOrigin, "https://www.youtube-nocookie.com"]
    .filter(Boolean)
    .join(" ");

  const directives = [
    `default-src 'self'`,
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' blob: data: https:`,
    `font-src 'self'`,
    `connect-src ${connectSrc}`,
    `frame-src ${frameSrc}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'none'`,
  ];
  if (!isDev) directives.push(`upgrade-insecure-requests`);

  return directives.join("; ");
}

export async function proxy(request: NextRequest) {
  const nonce = Buffer.from(crypto.randomUUID()).toString("base64");
  const csp = buildCsp(nonce);

  // The CSP must be on the *request* headers so Next extracts the nonce and applies
  // it to the scripts it emits during SSR; x-nonce is read by the root layout.
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-nonce", nonce);
  requestHeaders.set("content-security-policy", csp);

  let response = NextResponse.next({ request: { headers: requestHeaders } });

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
          response = NextResponse.next({ request: { headers: requestHeaders } });
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
  const needsAuth = !PUBLIC_PATHS.includes(pathname);

  if (needsAuth) {
    // Not logged in → send to login, remembering where they were headed.
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.search = `?redirect=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }

    // Logged in but hitting /admin without the admin role → back to dashboard.
    if (matchesPrefix(pathname, ADMIN_PREFIX)) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      if (profile?.role !== "admin") {
        // Redirect rather than render a 403: middleware can't use Next's
        // `forbidden()` (server components only, and still experimental). The
        // flag tells the dashboard to explain why they were bounced.
        const url = request.nextUrl.clone();
        url.pathname = "/dashboard";
        url.search = "?denied=admin";
        return NextResponse.redirect(url);
      }
    }
  }

  // Attach the CSP to the rendered response. Redirect branches above return early —
  // they carry no HTML/scripts, so they don't need it.
  response.headers.set("content-security-policy", csp);
  return response;
}

export const config = {
  // Run on everything except Next internals and static assets.
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
