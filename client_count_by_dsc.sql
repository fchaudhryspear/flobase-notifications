-- Client Count by DSC
SELECT 
    ds.id AS dsc_id,
    ds.name AS dsc_name,
    ds.code AS dsc_code,
    COUNT(DISTINCT c.client_id) AS total_clients,
    COUNT(DISTINCT c.client_id) FILTER (WHERE c.first_payment_clear_date IS NOT NULL) AS active_clients,
    COUNT(DISTINCT c.client_id) FILTER (WHERE c.tranche_id IS NOT NULL) AS purchased_clients
FROM dsc_settings ds
LEFT JOIN clients c ON c.dsc_id = ds.id AND c.is_latest_record = true
WHERE ds.is_active = true
GROUP BY ds.id, ds.name, ds.code
ORDER BY total_clients DESC;
