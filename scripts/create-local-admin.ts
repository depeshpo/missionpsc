/**
 * Create (or promote) the admin user in the LOCAL Supabase stack.
 *
 *   ADMIN_PASSWORD='choose-a-dev-password' npm run admin:local
 *   # optional: ADMIN_EMAIL=you@example.com (defaults to admin@mofa.com)
 *
 * Reads .env.local (via the npm script's --env-file). Uses the service-role key
 * to create the user with email pre-confirmed; the on_auth_user_created trigger
 * inserts the profiles row, then we set role='admin'. Idempotent: if the user
 * already exists it just (re)sets the password and ensures the admin role.
 *
 * SAFETY: refuses to run against anything but a local URL, so it can never touch
 * the production project. Local dev only — never ship this.
 */
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const email = process.env.ADMIN_EMAIL || "admin@mofa.com";
const password = process.env.ADMIN_PASSWORD;

if (!url || !serviceKey) {
  console.error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local.");
  process.exit(1);
}

// Hard guard: only ever run against the local stack.
if (!/^https?:\/\/(127\.0\.0\.1|localhost)(:|\/|$)/.test(url)) {
  console.error(
    `Refusing to run: NEXT_PUBLIC_SUPABASE_URL is "${url}", which is not a local\n` +
      "Supabase URL. This script is for the local dev stack only (127.0.0.1). If you\n" +
      "meant to manage a real admin, do it deliberately against the right project.",
  );
  process.exit(1);
}

if (!password) {
  console.error("Set a password: ADMIN_PASSWORD='…' npm run admin:local");
  process.exit(1);
}

const db = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

async function findUserByEmail(target: string) {
  // Page through admin.listUsers (local dev has few users).
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await db.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const hit = data.users.find((u) => u.email?.toLowerCase() === target.toLowerCase());
    if (hit) return hit;
    if (data.users.length < 200) break;
  }
  return null;
}

async function main() {
  console.log(`Local admin setup on ${url}`);

  let userId: string;
  const existing = await findUserByEmail(email);

  if (existing) {
    const { error } = await db.auth.admin.updateUserById(existing.id, {
      password: password!,
      email_confirm: true,
    });
    if (error) throw error;
    userId = existing.id;
    console.log(`  updated existing user ${email}`);
  } else {
    const { data, error } = await db.auth.admin.createUser({
      email,
      password: password!,
      email_confirm: true,
    });
    if (error) throw error;
    userId = data.user!.id;
    console.log(`  created user ${email}`);
  }

  // The on_auth_user_created trigger inserts the profiles row; ensure admin role.
  const { error: roleError } = await db
    .from("profiles")
    .update({ role: "admin" })
    .eq("id", userId);
  if (roleError) throw roleError;

  console.log(`  role set to admin. You can now sign in locally as ${email}.`);
}

main().catch((e) => {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
});
