#!/usr/bin/env python3
import psycopg2
import sys

host = "flobase-prod.cu52siwak795.us-east-1.rds.amazonaws.com"
port = 5432
database = "flobase"
user = "flobase_admin"
password = "vGZpUx_4x9s'|9CB9-Yv5lo`1yi(xdVN"

try:
    conn = psycopg2.connect(
        host=host,
        port=port,
        dbname=database,
        user=user,
        password=password,
        sslmode='require',
        connect_timeout=5
    )
    cur = conn.cursor()
    cur.execute("""
        SELECT sofr_rate, sofr_floor, sofr_rate_pct, sofr_floor_pct, updated_at 
        FROM investor_snapshot 
        ORDER BY updated_at DESC 
        LIMIT 5
    """)
    rows = cur.fetchall()
    colnames = [desc[0] for desc in cur.description]
    for row in rows:
        print(dict(zip(colnames, row)))
    cur.close()
    conn.close()
except Exception as e:
    print(f"Error: {e}")
    sys.exit(1)