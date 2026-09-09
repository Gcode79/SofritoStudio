-- ============================================================
-- Migration 0002 — qualification-based inquiry fields
-- Adds stage/timeline/city/decision columns to leads.
-- Apply: npx wrangler d1 migrations apply sofrito-db --remote
-- ============================================================

ALTER TABLE leads ADD COLUMN stage TEXT;
ALTER TABLE leads ADD COLUMN timeline TEXT;
ALTER TABLE leads ADD COLUMN city TEXT;
ALTER TABLE leads ADD COLUMN decision TEXT;