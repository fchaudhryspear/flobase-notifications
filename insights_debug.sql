-- Insights Dashboard Debug Queries
-- Run these to diagnose why the insights dashboard isn't loading

-- 1. Check total client count (all time)
SELECT 'total_clients_all_time' AS metric, COUNT(*) AS value
FROM clients
WHERE is_latest_record = true

UNION ALL

-- 2. Check clients with cleared payments (used in insights)
SELECT 'clients_with_cleared_payments' AS metric, COUNT(*) AS value
FROM clients
WHERE is_latest_record = true
  AND first_payment_clear_date IS NOT NULL

UNION ALL

-- 3. Check client_debts table exists and has data
SELECT 'client_debts_count' AS metric, COUNT(*) AS value
FROM client_debts
WHERE is_latest_record = true

UNION ALL

-- 4. Check client_debts with creditor info
SELECT 'client_debts_with_creditor' AS metric, COUNT(*) AS value
FROM client_debts
WHERE is_latest_record = true
  AND creditor_name IS NOT NULL AND creditor_name != ''

UNION ALL

-- 5. Check DSC count
SELECT 'dsc_count' AS metric, COUNT(*) AS value
FROM dsc_settings
WHERE is_active = true;

-- 6. Sample client_debts data
SELECT creditor_name, credit_type, COUNT(*) AS count
FROM client_debts
WHERE is_latest_record = true
GROUP BY creditor_name, credit_type
ORDER BY count DESC
LIMIT 10;
