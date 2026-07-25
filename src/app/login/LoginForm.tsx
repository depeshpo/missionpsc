"use client";

import { useActionState, useEffect, useRef } from "react";
import { login, type LoginState } from "./actions";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";
import { toast } from "@/lib/toast";

/**
 * Client login form. `useActionState` surfaces the action's error without a
 * redirect, so a failed sign-in shows a toast (and an inline note for no-JS).
 * Success redirects inside the action.
 */
export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState<LoginState, FormData>(login, {});
  const lastError = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (state.error && state.error !== lastError.current) {
      lastError.current = state.error;
      toast.error(state.error);
    }
  }, [state]);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      <Field label="Email" htmlFor="email" required>
        <Input id="email" name="email" type="email" autoComplete="email" required />
      </Field>
      <Field label="Password" htmlFor="password" required>
        <Input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
        />
      </Field>
      {state.error ? (
        <div
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive"
        >
          {state.error}
        </div>
      ) : null}
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
    </form>
  );
}
