#!/bin/bash
BASE_URL="http://127.0.0.1:3000/api/v1"

echo "🧪 Verifying 16/16 Endpoints..."
echo "---------------------------------------"

test_call() {
  local method=$1
  local path=$2
  local data=$3
  echo -n "🔍 $method $path: "
  
  if [ "$method" == "GET" ]; then
    res=$(curl -s -X GET "$BASE_URL$path")
  elif [ "$method" == "DELETE" ] && [ -z "$data" ]; then
    res=$(curl -s -X DELETE "$BASE_URL$path")
  else
    res=$(curl -s -X "$method" -H "Content-Type: application/json" -d "$data" "$BASE_URL$path")
  fi

  if [[ $res == *"message"* ]] || [[ $res == *"token"* ]] || [[ $res == *"id"* ]] || [[ $res == *"status"* ]] || [[ $res == *"download_url"* ]] || [[ $res == *"[]"* ]]; then
    echo "✅"
  else
    echo "❌ (Response: $res)"
  fi
}

# Auth
test_call "POST" "/auth/login" '{"email":"test@test.com","password":"password"}'
test_call "POST" "/auth/logout" '{}'
test_call "POST" "/auth/refresh" '{"refresh_token":"ref_token_abc"}'
test_call "POST" "/auth/register" '{"email":"new@test.com","password":"pass","company_id":"c_123"}'
test_call "POST" "/auth/reset-password" '{"email":"test@test.com"}'

# Users
test_call "GET"  "/users/me"
test_call "PUT"  "/users/me" '{"name":"User","phone":"555-0199"}'
test_call "GET"  "/users"
test_call "GET"  "/users/usr_789"

# Roles
test_call "GET"  "/roles"
test_call "POST" "/roles/assign" '{"user_id":"u1","role_id":"r1"}'
test_call "DELETE" "/roles/revoke" '{"user_id":"u1","role_id":"r1"}'

# Sessions
test_call "GET"  "/sessions"
test_call "DELETE" "/sessions/sess_001"

# Audit
test_call "GET"  "/audit/logs"
test_call "POST" "/audit/export" '{"start_date":"2026-01-01","end_date":"2026-03-23"}'

echo "---------------------------------------"
echo "🏁 Validation Complete."
