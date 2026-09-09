-- ============================================================
-- Migration 0003 — invoice triggers (binary milestone ledger)
-- Purpose: one row per milestone invoice per project. The
--   approval_confirmed_at / files_delivered_at stamps ARE the
--   binary trigger evidence the templates reference. UNIQUE
--   (project_id, milestone) makes double-billing impossible.
-- Money as INTEGER cents. ids TEXT (matches projects.id TEXT).
-- status stored as pending|sent|paid; 'overdue' is computed in
--   v_invoice_status so it can never go stale.
-- Apply: npx wrangler d1 migrations apply sofrito-db --remote
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
  id                  TEXT PRIMARY KEY,
  created_at          TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now')),
  project_id          TEXT NOT NULL REFERENCES projects(id),
  milestone           TEXT NOT NULL CHECK (milestone IN ('deposit','milestone_25','final_25')),
  amount_cents        INTEGER NOT NULL,
  currency            TEXT NOT NULL DEFAULT 'usd',
  stripe_invoice_id   TEXT,
  status              TEXT NOT NULL DEFAULT 'pending',   -- pending|sent|paid
  sent_at             TEXT,
  paid_at             TEXT,
  approval_confirmed_at TEXT,                             -- milestone_25: client's written "approved" logged
  files_delivered_at  TEXT,                               -- final_25: deliverables sent to client
  notes               TEXT
);
CREATE INDEX IF NOT EXISTS idx_invoices_project ON invoices(project_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status  ON invoices(status);
CREATE UNIQUE INDEX IF NOT EXISTS idx_invoices_milestone ON invoices(project_id, milestone);

CREATE VIEW IF NOT EXISTS v_invoice_status AS
SELECT
  p.id                AS project_id,
  p.name              AS client_name,
  p.package_name      AS package,
  p.price_cents       AS project_value_cents,
  i.milestone,
  i.amount_cents,
  i.status,
  i.sent_at,
  i.paid_at,
  CASE
    WHEN i.paid_at IS NOT NULL THEN 'paid'
    WHEN i.sent_at IS NOT NULL AND julianday('now') - julianday(i.sent_at) > 7 THEN 'overdue'
    WHEN i.sent_at IS NOT NULL THEN 'sent'
    ELSE 'pending'
  END                 AS computed_status,
  i.approval_confirmed_at,
  i.files_delivered_at
FROM invoices i
JOIN projects p ON i.project_id = p.id
ORDER BY i.created_at DESC;