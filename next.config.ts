import type { NextConfig } from "next";

// Static security headers applied to every response (including static assets, which
// the proxy matcher skips). The nonce-based Content-Security-Policy is set per
// request in src/proxy.ts, not here — it needs a fresh nonce each time. HSTS is
// added automatically by Vercel over HTTPS, so it's not set here.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
];

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
