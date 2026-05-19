#!/bin/bash
# Run this in AWS CloudShell to create new access keys

USER_NAME="BedrockAPIKey-0g4z"

echo "Creating new access key for user: $USER_NAME"
echo ""

# List existing keys
echo "Checking existing access keys..."
EXISTING_KEYS=$(aws iam list-access-keys --user-name $USER_NAME --query 'AccessKeyMetadata[*].AccessKeyId' --output text)

if [ ! -z "$EXISTING_KEYS" ]; then
    echo "Found existing keys. Deleting old keys..."
    for KEY in $EXISTING_KEYS; do
        echo "Deleting key: $KEY"
        aws iam delete-access-key --user-name $USER_NAME --access-key-id $KEY
    done
fi

# Create new access key
echo ""
echo "Creating new access key..."
CREDENTIALS=$(aws iam create-access-key --user-name $USER_NAME --output json)

echo ""
echo "=========================================="
echo "✅ New Access Key Created!"
echo "=========================================="
echo ""
echo "Access Key ID:"
echo $CREDENTIALS | jq -r '.AccessKey.AccessKeyId'
echo ""
echo "Secret Access Key:"
echo $CREDENTIALS | jq -r '.AccessKey.SecretAccessKey'
echo ""
echo "=========================================="
echo ""
echo "⚠️  COPY THESE CREDENTIALS NOW!"
echo ""
echo "Next: Run 'aws configure' and paste these values"
