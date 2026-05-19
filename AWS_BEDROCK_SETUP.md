# AWS Bedrock Setup Guide

## Prerequisites
- AWS Account (create at https://aws.amazon.com)
- AWS CLI installed (https://aws.amazon.com/cli/)

## Step 1: Install AWS CLI (if not installed)

### macOS:
```bash
brew install awscli
```

### Verify installation:
```bash
aws --version
```

## Step 2: Create IAM User with Bedrock Access

1. **Log into AWS Console**: https://console.aws.amazon.com
2. **Navigate to IAM**: Search for "IAM" in the top search bar
3. **Create User**:
   - Click "Users" → "Create user"
   - Username: `bedrock-travel-app`
   - Click "Next"
4. **Set Permissions**:
   - Select "Attach policies directly"
   - Click "Create policy" (opens new tab)
   - Select "JSON" tab and paste:
   ```json
   {
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
   }
   ```
   - Click "Next"
   - Policy name: `BedrockInvokePolicy`
   - Click "Create policy"
5. **Back to user creation**:
   - Refresh the policy list
   - Search and select `BedrockInvokePolicy`
   - Click "Next" → "Create user"
6. **Create Access Keys**:
   - Click on the created user
   - Go to "Security credentials" tab
   - Click "Create access key"
   - Select "Application running outside AWS"
   - Click "Next" → "Create access key"
   - **IMPORTANT**: Copy both:
     - Access Key ID
     - Secret Access Key
   - Click "Done"

## Step 3: Enable Bedrock Model Access

1. **Navigate to Bedrock**: https://console.aws.amazon.com/bedrock
2. **Select Region**: Choose `us-east-1` (N. Virginia) or `us-west-2` (Oregon)
3. **Enable Model Access**:
   - Click "Model access" in left sidebar
   - Click "Enable specific models" or "Manage model access"
   - Select these models:
     - ✅ **Claude 3 Haiku** (recommended - cheapest)
     - ✅ Claude 3 Sonnet (optional - better quality)
     - ✅ Amazon Titan Text (optional - backup)
   - Click "Request model access"
   - Wait 1-2 minutes for approval (usually instant)
   - Verify status shows "Access granted" (green)

## Step 4: Configure AWS Credentials

### Option A: Using AWS CLI (Recommended)
```bash
aws configure
```
Enter when prompted:
- **AWS Access Key ID**: [paste from Step 2]
- **AWS Secret Access Key**: [paste from Step 2]
- **Default region name**: `us-east-1`
- **Default output format**: `json`

### Option B: Using Environment Variables
Add to your `~/.zshrc` or `~/.bash_profile`:
```bash
export AWS_ACCESS_KEY_ID="your-access-key-id"
export AWS_SECRET_ACCESS_KEY="your-secret-access-key"
export AWS_REGION="us-east-1"
```

Then run:
```bash
source ~/.zshrc  # or source ~/.bash_profile
```

### Option C: Using appsettings (Not Recommended for Production)
Add to `appsettings.Development.json`:
```json
{
  "AWS": {
    "Region": "us-east-1",
    "AccessKeyId": "your-access-key-id",
    "SecretAccessKey": "your-secret-access-key",
    "Bedrock": {
      "ModelId": "anthropic.claude-3-haiku-20240307-v1:0"
    }
  }
}
```

## Step 5: Verify Setup

Run this test command:
```bash
aws bedrock list-foundation-models --region us-east-1
```

You should see a list of available models including Claude 3 Haiku.

## Step 6: Run Your Application

```bash
cd apps/api
dotnet run
```

Test the recommendations endpoint:
```bash
curl -X POST http://localhost:5080/api/recommendations \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "sourceCity": "New York",
    "budgetMin": 1000,
    "budgetMax": 3000,
    "startDate": "2024-06-15",
    "days": 7,
    "interests": ["adventure", "culture"],
    "transportModes": ["flight", "train"]
  }'
```

## Available Models

| Model ID | Cost (per 1M tokens) | Best For |
|----------|---------------------|----------|
| `anthropic.claude-3-haiku-20240307-v1:0` | $0.25 input / $1.25 output | Fast, cheap, production |
| `anthropic.claude-3-sonnet-20240229-v1:0` | $3 input / $15 output | Better quality |
| `amazon.titan-text-express-v1` | $0.30 input / $0.40 output | AWS native |

## Configuration Options

Edit `appsettings.Development.json`:

```json
{
  "AWS": {
    "Region": "us-east-1",  // Change to us-west-2 if needed
    "Bedrock": {
      "ModelId": "anthropic.claude-3-haiku-20240307-v1:0"  // Change model here
    }
  }
}
```

## Troubleshooting

### Error: "Access Denied"
- Verify IAM policy is attached to your user
- Check AWS credentials are configured correctly
- Ensure you're using the correct region

### Error: "Model not found"
- Go to Bedrock console → Model access
- Verify Claude 3 Haiku shows "Access granted"
- Wait 2-3 minutes after requesting access

### Error: "Credentials not found"
- Run `aws configure` again
- Verify `~/.aws/credentials` file exists
- Check environment variables are set

### High Costs
- Switch to Claude 3 Haiku (cheapest)
- Monitor usage in AWS Cost Explorer
- Set up billing alerts in AWS Console

## Cost Estimation

**Claude 3 Haiku pricing:**
- Input: $0.25 per 1M tokens
- Output: $1.25 per 1M tokens

**Typical recommendation request:**
- Input: ~800 tokens (destination list + user preferences)
- Output: ~200 tokens (JSON recommendations)
- **Cost per request**: ~$0.0005 (half a cent)

**Monthly estimates:**
- 1,000 requests: ~$0.50
- 10,000 requests: ~$5.00
- 100,000 requests: ~$50.00

## Security Best Practices

1. **Never commit credentials** to Git
2. **Use IAM roles** in production (EC2, ECS, Lambda)
3. **Rotate access keys** regularly
4. **Set up billing alerts** in AWS Console
5. **Use least privilege** IAM policies

## Next Steps

1. Test the API with sample requests
2. Monitor costs in AWS Cost Explorer
3. Consider caching recommendations to reduce API calls
4. Implement rate limiting for production
5. Add error handling and retry logic

## Support

- AWS Bedrock Docs: https://docs.aws.amazon.com/bedrock/
- Claude API Docs: https://docs.anthropic.com/claude/reference/
- AWS Support: https://console.aws.amazon.com/support/
