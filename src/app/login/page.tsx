import Link from "next/link";
import { GraduationCap } from "lucide-react";
import { login } from "./actions";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { Field } from "@/components/ui/Field";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; redirect?: string }>;
}) {
  const { error, redirect: next } = await searchParams;

  return (
    <main className="grid min-h-screen place-items-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-3 grid h-11 w-11 place-items-center rounded-xl bg-primary text-primary-foreground">
            <GraduationCap className="h-6 w-6" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Sign in</h1>
          <p className="text-sm text-muted-foreground">Mission PSC — admin access</p>
        </div>

        <Card>
          <CardContent className="space-y-4">
            {error ? (
              <div
                role="alert"
                className="rounded-lg border border-warning/30 bg-warning/10 p-3 text-sm text-warning"
              >
                {error}
              </div>
            ) : null}

            <form action={login} className="space-y-4">
              <input type="hidden" name="redirect" value={next ?? "/admin"} />
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
              <Button type="submit" className="w-full">
                Sign in
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          <Link href="/" className="font-medium text-primary hover:underline">
            ← Back to site
          </Link>
        </p>
      </div>
    </main>
  );
}
