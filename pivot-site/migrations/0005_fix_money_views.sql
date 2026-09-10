DROP VIEW IF EXISTS v_pipeline;
DROP VIEW IF EXISTS v_monthly_revenue;

CREATE VIEW IF NOT EXISTS v_pipeline AS
SELECT
  'leads' AS kind,
  (SELECT COUNT(*) FROM leads WHERE status IN ('new','contacted','qualified')) AS open_leads,
  (SELECT COUNT(*) FROM projects WHERE status IN ('discovery','onboarding','active','review')) AS active_projects,
  (SELECT COALESCE(SUM(amount_cents),0)/100.0 FROM revenue
     WHERE occurred_at >= date('now','start of month')) AS revenue_mtd_dollars,
  (SELECT COALESCE(SUM(amount_cents),0)/100.0 FROM revenue
     WHERE occurred_at >= date('now','-30 days')) AS revenue_30d_dollars;

CREATE VIEW IF NOT EXISTS v_monthly_revenue AS
SELECT
  strftime('%Y-%m', occurred_at) AS month,
  source,
  COUNT(*) AS transaction_count,
  SUM(amount_cents)/100.0 AS dollars,
  COALESCE(SUM(CASE WHEN metadata IS NOT NULL THEN 1 ELSE 0 END),0) AS with_meta
FROM revenue
WHERE paid = 1
GROUP BY month, source
ORDER BY month DESC;