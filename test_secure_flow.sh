#!/bin/bash
BASE_URL="http://127.0.0.1:3000/api/v1"

echo "🔐 1. Authenticating as faisal@flobase.ai..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/auth/login" \
     -H "Content-Type: application/json" \
     -d '{"email": "faisal@flobase.ai", "password": "password123"}')

# Extract token using jq
TOKEN=$(echo $LOGIN_RESPONSE | jq -r .token)

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo "❌ Login failed. Response: $LOGIN_RESPONSE"
  exit 1
fi

echo "✅ Token received: ${TOKEN:0:20}..."

echo -e "\n🛡️ 2. Accessing Protected Route (/users/me)..."
curl -s -X GET "$BASE_URL/users/me" \
     -H "Authorization: Bearer $TOKEN" | jq

echo -e "\n🏁 Secure flow complete."
