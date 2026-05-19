#!/bin/bash

echo "🔍 AWS Bedrock Setup Verification"
echo "=================================="
echo ""

# Check AWS CLI
echo "1. Checking AWS CLI installation..."
if command -v aws &> /dev/null; then
    echo "   ✅ AWS CLI installed: $(aws --version)"
else
    echo "   ❌ AWS CLI not found. Install with: brew install awscli"
    exit 1
fi
echo ""

# Check AWS credentials
echo "2. Checking AWS credentials..."
if aws sts get-caller-identity &> /dev/null; then
    echo "   ✅ AWS credentials configured"
    aws sts get-caller-identity --query 'Account' --output text | xargs -I {} echo "   Account ID: {}"
else
    echo "   ❌ AWS credentials not configured. Run: aws configure"
    exit 1
fi
echo ""

# Check Bedrock access
echo "3. Checking Bedrock model access..."
REGION="${AWS_REGION:-us-east-1}"
echo "   Using region: $REGION"

if aws bedrock list-foundation-models --region $REGION &> /dev/null; then
    echo "   ✅ Bedrock API accessible"
    
    # Check Claude 3 Haiku specifically
    if aws bedrock list-foundation-models --region $REGION --query "modelSummaries[?contains(modelId, 'claude-3-haiku')].modelId" --output text | grep -q "claude-3-haiku"; then
        echo "   ✅ Claude 3 Haiku model available"
    else
        echo "   ⚠️  Claude 3 Haiku not found. Enable it in Bedrock console:"
        echo "      https://console.aws.amazon.com/bedrock/home?region=$REGION#/modelaccess"
    fi
else
    echo "   ❌ Cannot access Bedrock. Check IAM permissions."
    exit 1
fi
echo ""

# Check .NET SDK
echo "4. Checking .NET SDK..."
if command -v dotnet &> /dev/null; then
    echo "   ✅ .NET SDK installed: $(dotnet --version)"
else
    echo "   ❌ .NET SDK not found"
    exit 1
fi
echo ""

# Check project dependencies
echo "5. Checking project dependencies..."
cd "$(dirname "$0")/apps/api" || exit 1
if grep -q "AWSSDK.BedrockRuntime" TravelExperience.Api.csproj; then
    echo "   ✅ AWS Bedrock package installed"
else
    echo "   ❌ AWS Bedrock package missing. Run: dotnet add package AWSSDK.BedrockRuntime"
    exit 1
fi
echo ""

echo "=================================="
echo "✅ All checks passed!"
echo ""
echo "Next steps:"
echo "1. Ensure model access is enabled in Bedrock console"
echo "2. Run: cd apps/api && dotnet run"
echo "3. Test the /api/recommendations endpoint"
echo ""
echo "For detailed setup: see AWS_BEDROCK_SETUP.md"
