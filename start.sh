#!/usr/bin/env bash
#
# Mission PSC — one-command start.
#
#   ./start.sh          install if needed, run checks, start the dev server
#   ./start.sh --check  run the checks only, then exit
#
# The app is fully login-gated and every page reads from Supabase, so the most
# common "nothing works" cause is a paused free-tier Supabase project (it pauses
# after ~7 days idle). This script names that explicitly instead of leaving you
# with a raw 502.

set -uo pipefail
cd "$(dirname "$0")"

CHECK_ONLY=false
[ "${1:-}" = "--check" ] && CHECK_ONLY=true

# Colours only when attached to a terminal.
if [ -t 1 ]; then
  BOLD=$'\033[1m'; RED=$'\033[31m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; DIM=$'\033[2m'; OFF=$'\033[0m'
else
  BOLD=""; RED=""; GREEN=""; YELLOW=""; DIM=""; OFF=""
fi
ok()   { printf "  %s✓%s %s\n" "$GREEN" "$OFF" "$1"; }
warn() { printf "  %s!%s %s\n" "$YELLOW" "$OFF" "$1"; }
bad()  { printf "  %s✗%s %s\n" "$RED" "$OFF" "$1"; }
step() { printf "\n%s%s%s\n" "$BOLD" "$1" "$OFF"; }

FATAL=false

# --- 1. toolchain ------------------------------------------------------------
step "Toolchain"
if command -v node >/dev/null 2>&1; then
  ok "node $(node -v)"
else
  bad "node not found — install Node.js 20+ (https://nodejs.org)"
  FATAL=true
fi

# --- 2. dependencies ---------------------------------------------------------
step "Dependencies"
# Compare against node_modules/.package-lock.json, which npm rewrites on every
# install — the node_modules directory's own mtime doesn't change, so using it
# would re-install on every single run.
if [ ! -d node_modules ]; then
  warn "node_modules missing — running npm install"
  npm install || { bad "npm install failed"; exit 1; }
  ok "installed"
elif [ ! -f node_modules/.package-lock.json ] || [ package-lock.json -nt node_modules/.package-lock.json ]; then
  warn "dependencies out of date — running npm install"
  npm install || { bad "npm install failed"; exit 1; }
  ok "updated"
else
  ok "node_modules up to date"
fi

# --- 3. environment ----------------------------------------------------------
step "Environment"
SUPABASE_URL=""
SUPABASE_ANON=""
if [ ! -f .env.local ]; then
  bad ".env.local missing — copy .env.example to .env.local and fill in your Supabase keys"
  FATAL=true
else
  # Read values without echoing them.
  while IFS='=' read -r key value; do
    case "$key" in
      NEXT_PUBLIC_SUPABASE_URL)      SUPABASE_URL="${value%\"}"; SUPABASE_URL="${SUPABASE_URL#\"}" ;;
      NEXT_PUBLIC_SUPABASE_ANON_KEY) SUPABASE_ANON="${value%\"}"; SUPABASE_ANON="${SUPABASE_ANON#\"}" ;;
    esac
  done < <(grep -E '^[A-Z_]+=' .env.local)

  for var in NEXT_PUBLIC_SUPABASE_URL NEXT_PUBLIC_SUPABASE_ANON_KEY SUPABASE_SERVICE_ROLE_KEY; do
    if grep -qE "^${var}=.+" .env.local; then
      ok "$var set"
    else
      bad "$var missing or empty in .env.local"
      FATAL=true
    fi
  done
fi

# --- 4. supabase health ------------------------------------------------------
step "Supabase"
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_ANON" ]; then
  warn "skipped — Supabase URL/anon key not available"
else
  # Query a real public-readable table. NOTE: /rest/v1/ (the root) is not a valid
  # health check — the gateway answers 401 even while the database is down.
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" --max-time 15 \
    -H "apikey: ${SUPABASE_ANON}" -H "Authorization: Bearer ${SUPABASE_ANON}" \
    "${SUPABASE_URL}/rest/v1/papers?select=id&limit=1" 2>/dev/null)

  case "$STATUS" in
    200)
      ok "project awake and responding"
      ;;
    000)
      bad "cannot reach ${SUPABASE_URL}"
      printf "      %sCheck your internet connection, or the project URL in .env.local.%s\n" "$DIM" "$OFF"
      ;;
    502|503|504|521|522|544)
      bad "project looks PAUSED (HTTP $STATUS)"
      printf "      %sFree-tier Supabase projects pause after ~7 days idle. Your data is safe.%s\n" "$DIM" "$OFF"
      printf "      %sFix: open https://supabase.com/dashboard → this project → Restore, wait a%s\n" "$DIM" "$OFF"
      printf "      %sfew minutes, then re-run ./start.sh. Every page will error until it's up.%s\n" "$DIM" "$OFF"
      ;;
    401|403)
      bad "auth rejected (HTTP $STATUS) — the anon key in .env.local may be wrong or rotated"
      ;;
    *)
      warn "unexpected response (HTTP $STATUS) — the app may not work correctly"
      ;;
  esac
fi

# --- 5. go -------------------------------------------------------------------
if [ "$FATAL" = true ]; then
  printf "\n%sFix the ✗ items above before starting.%s\n" "$RED" "$OFF"
  exit 1
fi

if [ "$CHECK_ONLY" = true ]; then
  printf "\n%sChecks done.%s\n" "$BOLD" "$OFF"
  exit 0
fi

step "Starting dev server"
printf "  %shttp://localhost:3000 — sign in to get past the landing page (Ctrl+C to stop)%s\n\n" "$DIM" "$OFF"
exec npm run dev
