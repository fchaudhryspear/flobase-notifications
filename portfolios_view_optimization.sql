-- Portfolio View Optimization Recommendations
-- Run in your RDS Postgres instance

-- 1. Materialize the view (critical for 2.5s query performance)
DROP MATERIALIZED VIEW IF EXISTS mv_portfolio_summary;
CREATE MATERIALIZED VIEW mv_portfolio_summary AS
WITH deduped_clients AS (
    SELECT DISTINCT ON (client_id, dsc_id)
           client_id, dsc_id, tranche_id, enrolled_debt, settled_debt,
           cancelled_debt, eligible, is_latest_record
    FROM clients
    WHERE is_latest_record = true
    ORDER BY client_id, dsc_id, updated_at DESC NULLS LAST
)
SELECT
    ds.id AS dsc_id,
    ds.name AS dsc_name,
    ds.code AS dsc_code,
    COUNT(DISTINCT tm.id) AS vintage_count,
    COUNT(DISTINCT c.client_id) AS total_client_count,
    COUNT(DISTINCT CASE WHEN c.tranche_id IS NOT NULL THEN c.client_id END) AS purchased_client_count,
    COUNT(DISTINCT CASE WHEN c.eligible = true AND c.tranche_id IS NULL THEN c.client_id END) AS eligible_client_count,
    COALESCE(SUM(DISTINCT tm.purchase_price), 0) AS total_capital_deployed,
    COALESCE(SUM(c.enrolled_debt), 0) AS total_enrolled_debt,
    COALESCE(SUM(c.settled_debt), 0) AS total_settled_debt,
    COALESCE(SUM(c.cancelled_debt), 0) AS total_cancelled_debt,
    COALESCE(SUM(c.enrolled_debt), 0) - COALESCE(SUM(c.settled_debt), 0)
        - COALESCE(SUM(c.cancelled_debt), 0) AS existing_balance
FROM dsc_settings ds
LEFT JOIN deduped_clients c ON c.dsc_id = ds.id
LEFT JOIN tranche_master tm ON tm.dsc_id = ds.id AND tm.status = 'active'
WHERE ds.is_active = true
GROUP BY ds.id, ds.name, ds.code;

-- 2. Create indexes for fast lookups
CREATE INDEX IF NOT EXISTS idx_clients_client_dsc ON clients(client_id, dsc_id) WHERE is_latest_record = true;
CREATE INDEX IF NOT EXISTS idx_clients_is_latest ON clients(is_latest_record);
CREATE INDEX IF NOT EXISTS idx_tranche_master_dsc_status ON tranche_master(dsc_id, status) WHERE status = 'active';
CREATE INDEX IF NOT EXISTS idx_dsc_settings_is_active ON dsc_settings(is_active);

-- 3. Add indexes to dsc_settings and clients for faster JOINs
CREATE INDEX IF NOT EXISTS idx_clients_dsc_id ON clients(dsc_id);
CREATE INDEX IF NOT EXISTS idx_tranche_master_dsc_id ON tranche_master(dsc_id);

-- 4. Refresh materialized view periodically (add to cron job)
-- REFRESH MATERIALIZED VIEW mv_portfolio_summary;

-- 5. Grant permissions (if needed)
-- GRANT SELECT ON mv_portfolio_summary TO flobase_user;

-- Performance Notes:
-- - Materialized view caches computed results (100x faster than VIEW)
-- - Indexes on client_id,dsc_id speed up DISTINCT ON
-- - Conditional indexes reduce index size
-- - Expected query time: <50ms (vs 2500ms today)
