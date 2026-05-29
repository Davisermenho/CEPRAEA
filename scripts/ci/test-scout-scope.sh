#!/usr/bin/env bash
# Validates the scout_pattern regex used in scout-preview-smoke.yml.
# Must be kept in sync with the scout_pattern defined in that workflow.
set -euo pipefail

SCOUT_PATTERN='^(src/features/scout/|src/features/presence-tokens/|src/lib/supabase\.ts$|supabase/migrations/[0-9]+_scout|supabase/migrations/[0-9]+_presence|supabase/migrations/[0-9]+_cepr_00[89]|supabase/tests/[^/]*scout|supabase/functions/|e2e/scout/|playwright\.scout-preview-smoke\.config\.ts$|package\.json$|package-lock\.json$|\.github/workflows/scout-preview-smoke\.yml$)'

pass=0
fail=0

assert_match() {
  local path="$1"
  local expected="$2"  # "true" or "false"
  if printf '%s\n' "$path" | grep -Eq "$SCOUT_PATTERN"; then
    actual="true"
  else
    actual="false"
  fi
  if [ "$actual" = "$expected" ]; then
    echo "PASS [$actual]: $path"
    ((pass++)) || true
  else
    echo "FAIL: $path => expected scout=$expected, got scout=$actual"
    ((fail++)) || true
  fi
}

echo "=== scout=true (deve corresponder) ==="
assert_match "src/features/scout/pages/ScoutWorkspacePage.tsx"                  "true"
assert_match "src/features/scout/hooks/useScoutSession.ts"                      "true"
assert_match "src/features/presence-tokens/PresenceTokenList.tsx"               "true"
assert_match "src/lib/supabase.ts"                                              "true"
assert_match "supabase/migrations/0031_cepr_0090_live_collection_semantics.sql" "true"
assert_match "supabase/migrations/0089_cepr_0089_scout_events.sql"              "true"
assert_match "supabase/migrations/0012_scout_actions.sql"                       "true"
assert_match "supabase/migrations/0020_presence_tokens.sql"                     "true"
assert_match "supabase/tests/scout_contract.test.sql"                           "true"
assert_match "supabase/functions/process-events/index.ts"                       "true"
assert_match "e2e/scout/scoutSession.spec.ts"                                   "true"
assert_match "playwright.scout-preview-smoke.config.ts"                         "true"
assert_match "package.json"                                                     "true"
assert_match "package-lock.json"                                                "true"
assert_match ".github/workflows/scout-preview-smoke.yml"                        "true"

echo ""
echo "=== scout=false (não deve corresponder) ==="
assert_match "supabase/migrations/0040_access_resolution.sql"                   "false"
assert_match "supabase/migrations/0041_onboarding_rpcs.sql"                     "false"
assert_match "supabase/migrations/0042_backfill_auth_consistency.sql"           "false"
assert_match "supabase/tests/access_contract.test.sql"                          "false"
assert_match "docs/auth/AUTH_ACCESS_CONTRACT.md"                                "false"
assert_match "src/features/auth/AccessContext.tsx"                              "false"
assert_match "src/shared/layouts/AppAccessGuard.tsx"                            "false"
assert_match "src/types/supabase.ts"                                            "false"
assert_match "AGENTS.md"                                                        "false"
assert_match "src/App.tsx"                                                      "false"
assert_match "e2e/guards.spec.ts"                                               "false"
assert_match "e2e/access/auth-guard.spec.ts"                                    "false"

echo ""
echo "Results: $pass passed, $fail failed"
[ "$fail" -eq 0 ]
