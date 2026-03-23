-- Eligibility Engine Debug Query
-- Run this to verify the eligibility engine can access client data

-- 1. Check if DSC exists and is active
SELECT id, name, code, is_active, advance_rate_pct
FROM dsc_settings
WHERE id = '<DSC_ID_HERE>'
  AND is_active = true;

-- 2. Check un-purchased clients (tranche_id IS NULL)
SELECT COUNT(*) AS total_unpurchased
FROM clients
WHERE dsc_id = '<DSC_ID_HERE>'
  AND is_latest_record = true
  AND tranche_id IS NULL;

-- 3. Sample client data for eligibility check
SELECT client_id, company_name, enrolled_debt, epf_percentage,
       contact_status, payment_frequency, number_of_cleared_payments,
       first_payment_clear_date, credit_score, total_expected_fee
FROM clients
WHERE dsc_id = '<DSC_ID_HERE>'
  AND is_latest_record = true
  AND tranche_id IS NULL
ORDER BY enrolled_debt DESC NULLS LAST
LIMIT 10;

-- 4. Check if there's data to process (should have rows)
SELECT 
    COUNT(*) as total_clients,
    COUNT(*) FILTER (WHERE tranche_id IS NULL) as unpurchased_clients,
    AVG(enrolled_debt) FILTER (WHERE tranche_id IS NULL) as avg_debt_unpurchased,
    MIN(enrolled_debt) FILTER (WHERE tranche_id IS NULL) as min_debt_unpurchased
FROM clients
WHERE dsc_id = '<DSC_ID_HERE>'
  AND is_latest_record = true;
