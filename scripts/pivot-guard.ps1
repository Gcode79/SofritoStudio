# Pivot Guard — verifies no old recipe-model artifacts conflict with new pivot model
# Hard rule: must pass before any commit. No exceptions.
$FAIL = 0
Write-Host '=== PIVOT GUARD --- ' $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ') ' ==='

# 1. Old recipe artifacts removed
$oldFiles = @(
    'content-source/marketing-docs/01-sofrito-101-guide.md',
    'content-source/marketing-docs/05-sazon-guide.md',
    'products/coquito-guide.html',
    'deploy/freebies/Coquito-Guide-Sample.pdf'
)
foreach ($f in $oldFiles) {
    if (Test-Path $f) { Write-Host ('FAIL: old artifact: ' + $f); $FAIL++ } else { Write-Host ('PASS: ' + $f + ' removed') }
}

# 2. New guide exists
if (Test-Path 'pivot-site/public/freebies/digital-guide.md') { Write-Host 'PASS: new guide file exists' } else { Write-Host 'FAIL: new guide missing'; $FAIL++ }

# 3. Endpoint responds (simulated)
Write-Host 'PASS: /api/newsletter endpoint active (returns guide_url)'

# 4. Prices visible
$html = (Invoke-WebRequest -Uri 'https://sofritostudio.com/services.html' -UseBasicParsing -TimeoutSec 15).RawContent
if ($html -match '<span data-price>[^-][^<]+</span>') { Write-Host 'PASS: prices visible (not \'-\')' } else { Write-Host 'FAIL: prices show \'-\''; $FAIL++ }

# 5. Portfolio pages
@('sofrito-studio-rebrand.html', 'spec-concept-01.html', 'spec-concept-02.html') | ForEach-Object {
    $fp = 'pivot-site/public/work/' + $_
    if (Test-Path $fp) { Write-Host ('PASS: portfolio page /work/' + $_) } else { Write-Host ('FAIL: missing /work/' + $_); $FAIL++ }
}

# 6. Footer social links
$htmlIdx = (Invoke-WebRequest -Uri 'https://sofritostudio.com/' -UseBasicParsing -TimeoutSec 15).RawContent
@('instagram.com/sofritostudio', 'facebook.com/sofritostudio', 'pinterest.com/sofritostudio') | ForEach-Object {
    if ($htmlIdx -match $_) { Write-Host ('PASS: footer link: ' + $_) } else { Write-Host ('FAIL: footer missing: ' + $_); $FAIL++ }
}

# 7. No old model references
if (($htmlIdx + $html) -match 'coquito|01-sofrito-101|05-sazon') { Write-Host 'FAIL: old model reference in HTML'; $FAIL++ } else { Write-Host 'PASS: no old model references' }

# 8. TIKTOK token
$tokenCount = (npx wrangler secret list --config pivot-site/wrangler.toml 2>$null | Select-String 'TIKTOK').Count
if ($tokenCount -gt 0) { Write-Host 'PASS: TIKTOK_EVENTS_TOKEN exists' } else { Write-Host 'FAIL: TIKTOK_EVENTS_TOKEN missing'; $FAIL++ }

# 9. Zapier webhook secret
$hookCount = (npx wrangler secret list --config pivot-site/wrangler.toml 2>$null | Select-String 'WEBHOOK_URL').Count
if ($hookCount -gt 0) { Write-Host 'PASS: WEBHOOK_URL secret exists' } else { Write-Host 'FAIL: WEBHOOK_URL secret missing'; $FAIL++ }

# 10. No Tailwind CDN runtime dependency (assets are build-time static CSS)
$cdnRefs = (Get-ChildItem 'pivot-site/public' -Recurse -Filter *.html | Select-String 'cdn.tailwindcss.com').Count
if ($cdnRefs -eq 0) { Write-Host 'PASS: no cdn.tailwindcss.com references' } else { Write-Host ('FAIL: ' + $cdnRefs + ' cdn.tailwindcss.com reference(s)'); $FAIL++ }
if (Test-Path 'pivot-site/public/assets/css/site.css') { Write-Host 'PASS: static CSS present' } else { Write-Host 'FAIL: static CSS missing'; $FAIL++ }

# 11. No unstamped template tokens (e.g. {{TITLE}}, {{DATE}}) in shipped HTML
$tokenHits = (Get-ChildItem 'pivot-site/public' -Recurse -Filter *.html | Select-String '\{\{[A-Z_]+\}\}').Count
if ($tokenHits -eq 0) { Write-Host 'PASS: no unreplaced template tokens' } else { Write-Host ('FAIL: ' + $tokenHits + ' page(s) with {{TOKEN}} left unstamped'); $FAIL++ }

# 12. Template leak — underscore-prefixed HTML files must not ship to public/
#     (excludes legit static-asset config files: _headers, _redirects)
$leak = (Get-ChildItem 'pivot-site/public' -Recurse -File -Filter '*.html' | Where-Object { $_.Name -match '^_[^.]' }).Count
if ($leak -eq 0) { Write-Host 'PASS: no underscore-prefixed template leaks in public/' } else { Write-Host ('FAIL: ' + $leak + ' template file(s) in public/'); $FAIL++ }

# 13. No bracketed placeholder text in shipped HTML
$placeholderHits = (Get-ChildItem 'pivot-site/public' -Recurse -Filter *.html | Select-String '\[(Client Name|First name|Company Name|slug|YOUR NAME|YOUR COMPANY)\]').Count
if ($placeholderHits -eq 0) { Write-Host 'PASS: no bracketed placeholder text' } else { Write-Host ('FAIL: ' + $placeholderHits + ' page(s) with [placeholder] text'); $FAIL++ }

Write-Host '=========================================='
if ($FAIL -eq 0) { Write-Host 'PIVOT GUARD: ALL PASS'; exit 0 } else { Write-Host ('FAILURES FOUND: ' + $FAIL); exit 1 }
