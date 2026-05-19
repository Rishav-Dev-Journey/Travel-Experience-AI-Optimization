#!/bin/bash

echo "🔍 Debugging Recommendations Issue"
echo "===================================="
echo ""

# Check if PostgreSQL is running
echo "1. Checking PostgreSQL..."
if psql -d travel_experience -c "SELECT 1;" > /dev/null 2>&1; then
    echo "   ✅ PostgreSQL is running"
else
    echo "   ❌ PostgreSQL not accessible"
    echo "   Run: psql -d travel_experience"
    exit 1
fi
echo ""

# Check destinations table
echo "2. Checking destinations table..."
DEST_COUNT=$(psql -d travel_experience -t -c "SELECT COUNT(*) FROM destinations;" 2>/dev/null | xargs)
if [ "$DEST_COUNT" -gt 0 ]; then
    echo "   ✅ Found $DEST_COUNT destinations in database"
    echo ""
    echo "   Sample destinations:"
    psql -d travel_experience -c "SELECT name, country, array_length(interests, 1) as interest_count FROM destinations LIMIT 5;"
else
    echo "   ⚠️  No destinations found in database"
    echo ""
    echo "   Run migrations:"
    echo "   psql -d travel_experience -f infra/postgres/migrations/0005_destinations.sql"
fi
echo ""

# Check API is running
echo "3. Checking API status..."
if curl -s http://localhost:5080/api/health > /dev/null 2>&1; then
    echo "   ✅ API is running on http://localhost:5080"
else
    echo "   ❌ API is not running"
    echo "   Start with: cd apps/api && dotnet run"
    exit 1
fi
echo ""

# Check AWS credentials
echo "4. Checking AWS Bedrock access..."
if aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude-3-haiku')].modelId" --output text 2>/dev/null | grep -q "claude"; then
    echo "   ✅ AWS Bedrock accessible"
else
    echo "   ⚠️  AWS Bedrock not accessible (will use rule-based fallback)"
fi
echo ""

echo "===================================="
echo ""
echo "Next steps:"
echo "1. If destinations = 0, run: psql -d travel_experience -f infra/postgres/migrations/0005_destinations.sql"
echo "2. If API not running, run: cd apps/api && dotnet run"
echo "3. Test recommendations with a valid auth token"
echo ""
