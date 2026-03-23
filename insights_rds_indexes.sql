-- Insights Dashboard RDS Indexes
-- Run this in your RDS Postgres instance to speed up insights queries

-- Index for clients table (used by insights queries)
CREATE INDEX IF NOT EXISTS idx_clients_is_latest_clear ON clients(is_latest_record, first_payment_clear_date);
CREATE INDEX IF NOT EXISTS idx_clients_dsc_is_latest ON clients(dsc_id, is_latest_record);

-- Index for client_debts table
CREATE INDEX IF NOT EXISTS idx_client_debts_creditor ON client_debts(creditor_name) WHERE creditor_name IS NOT NULL;

-- Index for payment_ledger table
CREATE INDEX IF NOT EXISTS idx_payment_ledger_date ON payment_ledger(payment_date);

-- Index for pii_vault table
CREATE INDEX IF NOT EXISTS idx_pii_vault_client ON pii_vault(client_id);

-- Refresh existing indexes if they exist
-- CREATE INDEX IF NOT EXISTS idx_dsc_settings_is_active ON dsc_settings(is_active);

-- Verify indexes were created
SELECT indexname, tablename FROM pg_indexes WHERE tablename IN ('clients', 'client_debts', 'payment_ledger', 'pii_vault') ORDER BY tablename, indexname;
