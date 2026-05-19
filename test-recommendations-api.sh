#!/bin/bash

echo "🧪 Testing Recommendations API"
echo "==============================="
echo ""

# First, let's get a token by logging in
echo "Step 1: Request OTP..."
OTP_RESPONSE=$(curl -s -X POST http://localhost:5080/api/auth/request-otp \
  -H "Content-Type: application/json" \
  -d '{"identifier":"test@example.com","channel":"email"}')

echo "$OTP_RESPONSE" | jq '.'
echo ""

CHALLENGE_ID=$(echo "$OTP_RESPONSE" | jq -r '.challengeId')
DEMO_OTP=$(echo "$OTP_RESPONSE" | jq -r '.demoOtp')

if [ "$CHALLENGE_ID" == "null" ] || [ -z "$CHALLENGE_ID" ]; then
    echo "❌ Failed to get challenge ID"
    exit 1
fi

echo "Challenge ID: $CHALLENGE_ID"
echo "Demo OTP: $DEMO_OTP"
echo ""

# Verify OTP
echo "Step 2: Verify OTP..."
TOKEN_RESPONSE=$(curl -s -X POST http://localhost:5080/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d "{\"challengeId\":\"$CHALLENGE_ID\",\"otp\":\"$DEMO_OTP\"}")

echo "$TOKEN_RESPONSE" | jq '.'
echo ""

TOKEN=$(echo "$TOKEN_RESPONSE" | jq -r '.token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
    echo "❌ Failed to get token"
    exit 1
fi

echo "✅ Got token: ${TOKEN:0:20}..."
echo ""

# Test recommendations
echo "Step 3: Request recommendations..."
RECOMMENDATIONS=$(curl -s -X POST http://localhost:5080/api/recommendations \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "sourceCity": "Delhi",
    "budgetMin": 10000,
    "budgetMax": 50000,
    "startDate": "2024-07-01",
    "days": 5,
    "numberOfPeople": 2,
    "interests": ["Beach", "Adventure"],
    "transportModes": ["air", "train"]
  }')

echo "$RECOMMENDATIONS" | jq '.'
echo ""

# Check results
TOTAL=$(echo "$RECOMMENDATIONS" | jq -r '.total')
ENGINE=$(echo "$RECOMMENDATIONS" | jq -r '.engine')

if [ "$TOTAL" -gt 0 ]; then
    echo "✅ SUCCESS! Got $TOTAL recommendations"
    echo "   Engine: $ENGINE"
    echo ""
    echo "Top recommendation:"
    echo "$RECOMMENDATIONS" | jq '.results[0] | {name, score, scoreBreakdown}'
else
    echo "❌ No recommendations returned"
    echo "Response:"
    echo "$RECOMMENDATIONS"
fi
