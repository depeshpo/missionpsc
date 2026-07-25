"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Global top progress bar (GitHub/Vercel style), hand-rolled, no dependency.
 *
 * A document-level capture listener on <a> clicks starts the bar for genuine
 * path changes; the effect on `usePathname()` finishes it when the new route
 * commits. Query/hash-only navigations are skipped at the click stage, so the
 * bar can never start without a matching pathname change to complete it; a
 * safety timeout is a further backstop. Programmatic router.push after CRUD is
 * covered by toasts instead.
 */
export function TopProgress() {
  const pathname = usePathname();
  const [progress, setProgress] = useState(0); // 0 = idle/hidden
  const trickle = useRef<ReturnType<typeof setInterval> | null>(null);
  const safety = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);

  function clearTimers() {
    if (trickle.current) clearInterval(trickle.current);
    if (safety.current) clearTimeout(safety.current);
    trickle.current = null;
    safety.current = null;
  }

  function start() {
    if (active.current) return;
    active.current = true;
    setProgress(8);
    // Ease toward 90% while the route loads; slower as it fills.
    trickle.current = setInterval(() => {
      setProgress((p) => (p >= 90 ? p : p + Math.max(0.5, (90 - p) * 0.06)));
    }, 200);
    // Backstop: never leave the bar hanging.
    safety.current = setTimeout(finish, 10000);
  }

  function finish() {
    if (!active.current) return;
    active.current = false;
    clearTimers();
    setProgress(100);
    setTimeout(() => setProgress(0), 220);
  }

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey)
        return;
      const anchor = (e.target as Element | null)?.closest?.("a");
      if (!anchor) return;
      const href = anchor.getAttribute("href");
      const target = anchor.getAttribute("target");
      if (!href || target === "_blank" || anchor.hasAttribute("download")) return;

      let url: URL;
      try {
        url = new URL(href, window.location.href);
      } catch {
        return;
      }
      // Same-origin, real path change only (skip query/hash-only navs).
      if (url.origin !== window.location.origin) return;
      if (url.pathname === window.location.pathname) return;
      start();
    }

    document.addEventListener("click", onClick, { capture: true });
    return () => {
      document.removeEventListener("click", onClick, { capture: true });
      clearTimers();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // The new route committed — finish the bar.
  useEffect(() => {
    finish();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  if (progress === 0) return null;

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-x-0 top-0 z-[200] h-0.5 motion-reduce:transition-none transition-[width,opacity] duration-200 ease-out"
      style={{ width: `${progress}%`, opacity: progress >= 100 ? 0 : 1 }}
    >
      <div className="h-full w-full bg-primary shadow-[0_0_8px_var(--primary)]" />
    </div>
  );
}
