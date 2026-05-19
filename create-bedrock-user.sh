#!/bin/bash
# Run this script in AWS CloudShell (https://console.aws.amazon.com/cloudshell)

echo "Creating IAM user for Bedrock access..."

# Create IAM user
USER_NAME="bedrock-travel-app-$(date +%s)"
aws iam create-user --user-name $USER_NAME

# Create and attach policy
POLICY_NAME="BedrockInvokePolicy"
POLICY_ARN=$(aws iam create-policy --policy-name $POLICY_NAME-$(date +%s) --policy-document '{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "bedrock:InvokeModel",
        "bedrock:InvokeModelWithResponseStream"
      ],
      "Resource": "*"
    }
  ]
}' --query 'Policy.Arn' --output text)

# Attach policy to user
aws iam attach-user-policy --user-name $USER_NAME --policy-arn $POLICY_ARN

# Create access key
echo ""
echo "Creating access key..."
CREDENTIALS=$(aws iam create-access-key --user-name $USER_NAME --output json)

echo ""
echo "=========================================="
echo "✅ IAM User Created Successfully!"
echo "=========================================="
echo ""
echo "User Name: $USER_NAME"
echo ""
echo "Access Key ID:"
echo $CREDENTIALS | jq -r '.AccessKey.AccessKeyId'
echo ""
echo "Secret Access Key:"
echo $CREDENTIALS | jq -r '.AccessKey.SecretAccessKey'
echo ""
echo "=========================================="
echo ""
echo "⚠️  SAVE THESE CREDENTIALS NOW!"
echo "You won't be able to see the Secret Access Key again."
echo ""
echo "Next steps:"
echo "1. Copy the credentials above"
echo "2. Run: aws configure"
echo "3. Paste the credentials when prompted"
echo "4. Enable Bedrock model access at:"
echo "   https://console.aws.amazon.com/bedrock/home?region=us-east-1#/modelaccess"
