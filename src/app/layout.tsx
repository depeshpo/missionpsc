import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

// Applies the saved/preferred theme before paint to avoid a flash of the wrong
// theme. Injected via next/script (beforeInteractive) so it is hydration-safe.
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full scroll-smooth antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full">
        <Script id="theme-init" strategy="beforeInteractive">
          {themeInit}
        </Script>
        {/* Surface chrome (Learn header vs Dashboard sidebar) lives in each
            route group's own layout: src/app/(learn) and src/app/(dashboard). */}
        {children}
      </body>
    </html>
  );
}
