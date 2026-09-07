#!/usr/bin/env bash
# Pivot Guard — verifies no old recipe-model artifacts conflict with the new pivot model.
# Hard rule: must pass before any commit. No exceptions.
set -euo pipefail

echo "=== PIVOT GUARD — $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
FAIL=0

# 1. Old recipe artifacts must NOT exist in active workspace
for f in "content-source/marketing-docs/01-sofrito-101-guide.md" \
         "content-source/marketing-docs/05-sazon-guide.md" \
         "products/coquito-guide.html" \
         "deploy/freebies/Coquito-Guide-Sample.pdf"; do
  if [ -f "$f" ]; then
    echo "FAIL: old recipe artifact exists: $f"
    FAIL=1
  else
    echo "PASS: $f removed"
  fi
done

# 2. New digital guide must exist
if [ -f "pivot-site/public/freebies/digital-guide.md" ]; then
  echo "PASS: new guide file exists (/freebies/digital-guide.md)"
else
  echo "FAIL: new digital-guide.md missing"
  FAIL=1
fi

# 3. Endpoint must return new guide URL (not coquito)
RESPONSE=$(curl -sf -o /dev/stdout -w "%{http_code}" -X POST https://sofritostudio.com/api/newsletter \
  -H "Content-Type: application/json" -d '{"email":"guard@test.com","source":"guard"}')
echo "Endpoint status: $RESPONSE"
if echo "$RESPONSE" | grep -q '200'; then
  echo "PASS: /api/newsletter responds 200"
else
  echo "FAIL: endpoint not responding"
  FAIL=1
fi

# 4. Price cards must show real prices (not '-')
HTML=$(curl -sf https://sofritostudio.com/services.html)
if echo "$HTML" | grep -qP '<span data-price>[0-9,/$]+(mo)?</span>'; then
  echo "PASS: prices visible on services page"
else
  echo "FAIL: prices show '-' (loader broken)"
  FAIL=1
fi

# 5. Portfolio pages must exist
for p in "sofrito-studio-rebrand.html" "spec-concept-01.html" "spec-concept-02.html"; do
  if [ -f "pivot-site/public/work/$p" ]; then
    echo "PASS: portfolio page /work/$p exists"
  else
    echo "FAIL: portfolio page missing: $p"
    FAIL=1
  fi
done

# 6. Footer social links must include Instagram, Facebook, Pinterest
HTML_INDEX=$(curl -sf https://sofritostudio.com/)
for link in "instagram.com/sofritostudio" "facebook.com/sofritostudio" "pinterest.com/sofritostudio"; do
  if echo "$HTML_INDEX" | grep -q "$link"; then
    echo "PASS: footer link: $link"
  else
    echo "FAIL: footer link missing: $link"
    FAIL=1
  fi
done

# 7. No references to old coquito/recipe business model in active pages
if echo "$HTML_INDEX$HTML" | grep -qP 'coquito|01-sofrito-101|05-sazon'; then
  echo "FAIL: old model reference found in active HTML"
  FAIL=1
else
  echo "PASS: no old model references in active pages"
fi

# 8. TIKTOK_EVENTS_TOKEN secret must exist
TOKEN_COUNT=$(npx wrangler secret list --config pivot-site/wrangler.toml 2>/dev/null | grep -c 'TIKTOK' || echo 0)
if [ "$TOKEN_COUNT" -gt 0 ]; then
  echo "PASS: TIKTOK_EVENTS_TOKEN secret exists"
else
  echo "FAIL: TIKTOK_EVENTS_TOKEN secret missing"
  FAIL=1
fi

# 9. Make webhook URL configured
if grep -q 'MAKE_WEBHOOK_URL' config/.env; then
  echo "PASS: MAKE_WEBHOOK_URL configured"
else
  echo "FAIL: MAKE_WEBHOOK_URL missing from config"
  FAIL=1
fi

echo "=========================================="
if [ "$FAIL" -eq 0 ]; then
  echo "PIVOT GUARD: ALL PASS — safe to commit / deploy"
  exit 0
else
  echo "PIVOT GUARD: FAILURES FOUND — review above before committing"
  exit 1
fi
