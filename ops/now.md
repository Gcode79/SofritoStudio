# Ops — Now (current operating state, refreshed each working session)

> Snapshot 2026-09-09. This file is the single 5-minute catch-up for anyone (founder or agent) resuming work. When something changes, update it — do not let it go stale.

## Right now (2026-09-09)
- **Audit complete + corrected.** The 15-row D1 lead pool was re-audited today: **all 15 are QA/deploy artifacts** (pipeline tests, Zapier/webhook tests, deploy-window verification, founder self-test) — zero verified real leads, zero recorded revenue/invoices/bookings. The earlier "11 real leads" framing was retracted and patched across all docs.
- **First Assignment files:** being written now — 11 docs across `strategy/`, `ops/`, `sales/`, `growth/`, `research/` (this set). Deliverable: the operations report ending in founder decisions (below).
- **Booking automation:** coded + staged, migration `0004_calendly_bookings` applied to remote D1, booking email templates seeded. NOT deployed (owner sign-off + inputs pending).
- **Calendly MCP:** OAuth fixed (redirect URI corrected in `opencode.jsonc`); tools activate after an **opencode restart**.
- **Operating system installed (D7):** repo-scoped `opencode.json` (default agent = operator) + 7 specialist agents in `.opencode/agents/` + BUSINESS REASONING PROTOCOL in repo-root `AGENTS.md`. Active next session; this session continues under the same rules.
- **Social Content Operator installed (D8):** `.opencode/agents/social.md` — drafting/planning only, zero publish/account access. **First Assignment COMPLETE:** `growth/social/` system (strategy, calendar, library, performance, asset-register, approval-workflow, response-library, `drafts/SP-01/02/03`) + `research/social-sources.md`. **SP-01/02/03 content APPROVED by founder (2026-09-09)** in `approval-workflow.md`; next: mockup visuals → per-post publish go.
- **F7 money-fix bundle committed in-repo (`0dd9d61`):** `schema.sql` `/100.0` fixes + `migrations/0005_fix_money_views.sql` + `worker.js` F7 hunks (digest `toFixed(2)`), plus the Remotion skill pack (`pivot-site/skills/README.md` + 6 SKILL.md) and `ops/decision-log.md` + `ops/now.md`. Staged F7-only — the D4 Calendly webhook code stays **unstaged** in the working tree and is not committed/deployed. NOT pushed; NOT deployed.

## Known defects / loose ends (active)
1. **Placeholder emails:** 14/16 email templates missing from KV → confirmations/drip/follow-ups send a bare subject line. Fix ready (seed KV).
2. **Retainer waitlist leaks:** inert CTAs, no capture. Fix ready (POST `/api/leads`, source=`waitlist`).
3. **Session checkout gap:** session.html promises checkout, routes to contact form. Stopgap copy +/or staged booking deploy.
4. **Legacy docs out of date:** `marketing/general/kpi-scorecard.md` + `marketing/content_calendar/calendar.md` describe the retired product model — reconcile or archive.
5. **Brand Foundation undecided:** no price/deliverables; empty ladder slot.

## Blockers (waiting on owner)
- Approval to pursue real-demand: qualify the social-scan enrichment prospects (DavIsa/El Inquieto, Growee, El Chilar HF, Paldy) — the only real people on record — and/or choose a capture-validation move (D1 pool had zero real leads).
- Calendly event URL + webhook signing key.
- Stripe account + `STRIPE_API_KEY`.
- Billing mode (charge-at-booking vs invoice-after).
- Decisions: Brand Foundation, La Mesa policy, Tier 3.
- opencode restart (user action) to expose calendly tools.

## In flight (no sign-off required — reversible, housekeeping)
- **F7 money truncation FIXED in code (D15) + COMMITTED (`0dd9d61`):** revenue views + admin/digest query now divide by `100.0` (no more cent-truncation); migration `0005_fix_money_views.sql` + worker F7 hunks in commit. In-repo only — **deploying = owner approval**.
- Staged-but-not-deployed code (owner approval to ship together): GA4 snippet (D9), `page_view` emission (D11), F7 migration + worker (D15).
- **Skill registration junction `pivot-site/.agents/skills/`:** DEFERRED (D16 follow-up) — creating a local NTFS junction is a system-level change; noted here, not performed. Decide at next session.
- Writing this 11-file deliverable.
- Corrected the false "11 real leads" premise in all docs (QA-only pool, verified 15/15).
- Seeding the 14 missing email templates into KV (pure data; the one site-visible fix we can execute autonomously right now).

## Toolchain reminders
- D1 (remote) via MCP: database id `07a14d9b-...9071a` (wrangler token lacks D1 scope — use MCP for DB).
- KV config namespace `087850adfcab4ecf86a6987e32cc4cb2`.
- Live worker `40c50672-...`, account `b10d2ee39fa75abc3de1799de8903ebc`.
- Wrangler: always `-c wrangler.toml` from `pivot-site/`; `npm run check` + `wrangler deploy --dry-run` before any deploy.
- Local commits exist but are NOT pushed; safety copy at `SofritoStudio-Legacy/`.