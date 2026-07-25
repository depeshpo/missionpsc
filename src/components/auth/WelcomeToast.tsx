"use client";

import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { toast } from "@/lib/toast";

/**
 * Turns the one-shot `?welcome=1` set by the login redirect into a "Signed in"
 * toast on arrival, then strips the param from the URL (via history, so it
 * doesn't trigger another navigation). Mounted once in the root layout inside a
 * Suspense boundary (useSearchParams requires one).
 */
export function WelcomeToast() {
  const params = useSearchParams();
  const pathname = usePathname();
  const fired = useRef(false);

  useEffect(() => {
    if (params.get("welcome") !== "1" || fired.current) return;
    fired.current = true;
    toast.success("Signed in");
    const next = new URLSearchParams(params);
    next.delete("welcome");
    const qs = next.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [params, pathname]);

  return null;
}
