import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { headers } from "next/headers";
import "./globals.css";
import { Toaster } from "@/components/ui/Toaster";
import { TopProgress } from "@/components/layout/TopProgress";
import { WelcomeToast } from "@/components/auth/WelcomeToast";

// Applies the saved/preferred theme before paint to avoid a flash of the wrong
// theme. Rendered as a raw inline <script> carrying the per-request CSP nonce (see
// proxy.ts). suppressHydrationWarning is needed because React strips the nonce from
// the client-side representation, which would otherwise flag an attribute mismatch.
const themeInit = `(function(){try{var k='mission-psc:theme';var s=localStorage.getItem(k);var d=s==='dark'||(s===null&&window.matchMedia('(prefers-color-scheme: dark)').matches);document.documentElement.classList.toggle('dark',d);}catch(e){}})();`;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Mission PSC — Section Officer (MoFA)",
  description:
    "Study portal for the Nepal Lok Sewa Section Officer (Foreign Service) examination.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Set by the proxy per request. Reading it here also forces dynamic rendering,
  // which nonce-based CSP requires. Applied to our one inline script below; Next
  // applies the same nonce to its own scripts automatically.
  const nonce = (await headers()).get("x-nonce") ?? undefined;

  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <script
          nonce={nonce}
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: themeInit }}
        />
        <TopProgress />
        {/* Surface chrome (Learn header vs Dashboard sidebar) lives in each
            route group's own layout: src/app/(learn) and src/app/(dashboard). */}
        {children}
        <Toaster />
        <Suspense fallback={null}>
          <WelcomeToast />
        </Suspense>
      </body>
    </html>
  );
}
