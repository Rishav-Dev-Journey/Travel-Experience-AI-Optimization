#!/bin/bash

echo "🧪 Testing AWS Bedrock Integration"
echo "===================================="
echo ""

# Test 1: AWS Credentials
echo "1. Testing AWS Credentials..."
if aws sts get-caller-identity > /dev/null 2>&1; then
    echo "   ✅ AWS credentials valid"
    aws sts get-caller-identity --query 'Account' --output text | xargs -I {} echo "   Account: {}"
else
    echo "   ❌ AWS credentials invalid"
    exit 1
fi
echo ""

# Test 2: Bedrock Access
echo "2. Testing Bedrock Model Access..."
if aws bedrock list-foundation-models --region us-east-1 --query "modelSummaries[?contains(modelId, 'claude-3-haiku')].modelId" --output text | grep -q "claude-3-haiku"; then
    echo "   ✅ Claude 3 Haiku accessible"
else
    echo "   ❌ Claude 3 Haiku not accessible"
    echo "   Enable at: https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
    exit 1
fi
echo ""

# Test 3: Build Status
echo "3. Checking Application Build..."
if [ -f "apps/api/bin/Debug/net8.0/TravelExperience.Api.dll" ]; then
    echo "   ✅ Application built successfully"
else
    echo "   ❌ Application not built"
    exit 1
fi
echo ""

echo "===================================="
echo "✅ All checks passed!"
echo ""
echo "🚀 Ready to run the application:"
echo ""
echo "   cd apps/api"
echo "   dotnet run"
echo ""
echo "Then test the AI recommendations endpoint:"
echo ""
echo "   POST http://localhost:5080/api/recommendations"
echo ""
