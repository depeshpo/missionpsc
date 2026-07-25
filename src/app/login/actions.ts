"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export type LoginState = { error?: string };

/**
 * `useActionState` signature so the client form can toast the failure inline
 * (no redirect round-trip). On success it redirects to `next` with a one-shot
 * `welcome` flag that the destination turns into a "Signed in" toast.
 */
export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("redirect") ?? "") || "/admin";

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error: error.message };

  const sep = next.includes("?") ? "&" : "?";
  redirect(`${next}${sep}welcome=1`);
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
