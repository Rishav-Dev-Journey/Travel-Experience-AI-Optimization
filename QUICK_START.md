# 🚀 Quick Start Guide - Testing AI Recommendations

## ✅ Everything is Set Up!

Your AWS Bedrock integration is complete. Here's how to test it:

---

## Step 1: Start the API (Terminal 1)

```bash
cd apps/api
dotnet run
```

**Watch for these logs:**
- `Now listening on: http://localhost:5080`
- When you make a request, you'll see:
  - `Attempting AI recommendations with Bedrock...`
  - Either: `Successfully got X AI recommendations` (AI working!)
  - Or: `Bedrock failed, using rule-based fallback` (check AWS credentials)

---

## Step 2: Start the Web App (Terminal 2)

```bash
cd apps/web
npm run dev
```

Open: http://localhost:5173

---

## Step 3: Test the Flow

### 1. **Sign In**
   - Enter email: `test@example.com`
   - Click "Request OTP"
   - Copy the demo OTP from the response
   - Paste and verify

### 2. **Set Up Profile** (if new user)
   - Name: Your name
   - Home City: e.g., "Delhi"
   - Budget: Select "Mid-range"
   - Interests: Select 2-3 (e.g., Beach, Adventure)
   - Click "Save Profile"

### 3. **Plan a Trip**
   - Click "Plan a Trip" button
   - Fill in the form:
     - Source City: "Delhi"
     - Budget: 10000 - 50000
     - Start Date: Pick a future date
     - Duration: 5 days
     - Transport: Select "Air" and "Train"
     - Interests: Select "Beach" and "Adventure"
   - Click "🤖 Get AI Recommendations"

### 4. **Check Results**
   - You should see 5 destination cards
   - Look for the badge at the top:
     - ✅ "🤖 AI-Powered Recommendations" + "AWS Bedrock" badge = AI working!
     - ⚠️ "📊 Smart Recommendations" = Fallback to rule-based

---

## 🐛 Troubleshooting

### If you see "rule-based" instead of "ai":

1. **Check API logs** (Terminal 1):
   - Look for error messages after "Attempting AI recommendations..."
   
2. **Verify AWS credentials**:
   ```bash
   aws sts get-caller-identity
   ```
   Should show your account number.

3. **Test Bedrock directly**:
   ```bash
   aws bedrock list-foundation-models --region us-east-1 | grep claude-3-haiku
   ```
   Should show Claude 3 Haiku models.

4. **Check environment variables**:
   ```bash
   echo $AWS_ACCESS_KEY_ID
   echo $AWS_SECRET_ACCESS_KEY
   echo $AWS_REGION
   ```

5. **Restart the API** after fixing credentials:
   ```bash
   # Stop the API (Ctrl+C in Terminal 1)
   cd apps/api
   dotnet run
   ```

---

## 📊 What to Expect

### AI Recommendations (engine: "ai")
- More contextual reasoning
- Better understanding of preferences
- Personalized explanations
- Response time: 2-4 seconds

### Rule-Based Recommendations (engine: "rule-based")
- Simple scoring algorithm
- Fast response (<100ms)
- Basic matching logic
- Automatic fallback if AI fails

---

## 💡 Tips

1. **First request is slower** - AWS cold start (~3-5 seconds)
2. **Subsequent requests are faster** - (~1-2 seconds)
3. **Check API logs** - They show which engine is being used
4. **Try different inputs** - AI gives better results with specific preferences

---

## 🎯 Success Indicators

✅ API running on http://localhost:5080  
✅ Web app running on http://localhost:5173  
✅ Can sign in and set up profile  
✅ "Plan a Trip" form works  
✅ Getting 5 recommendations  
✅ Badge shows "AWS Bedrock" (AI working!)  

---

## 📝 Test Scenarios

### Scenario 1: Beach Vacation
- Budget: 15000-40000
- Days: 5
- Interests: Beach, Wellness
- Transport: Air
- **Expected**: Goa, Andaman, Kerala

### Scenario 2: Adventure Trip
- Budget: 20000-60000
- Days: 7
- Interests: Adventure, Mountains
- Transport: Air, Road
- **Expected**: Manali, Ladakh, Rishikesh

### Scenario 3: Cultural Tour
- Budget: 5000-25000
- Days: 3
- Interests: Culture, Food
- Transport: Train
- **Expected**: Varanasi, Jaipur, Kolkata

---

## 🔍 Debugging Commands

```bash
# Check if API is running
curl http://localhost:5080/api/health

# Check AWS credentials
aws sts get-caller-identity

# Check Bedrock access
aws bedrock list-foundation-models --region us-east-1

# Run full diagnostic
./debug-recommendations.sh

# Test API directly
./test-recommendations-api.sh
```

---

## 📞 Need Help?

1. Check API logs in Terminal 1
2. Run `./debug-recommendations.sh`
3. Verify AWS credentials are set
4. Ensure Bedrock model access is enabled in AWS Console

---

**Ready to test! Start both servers and try planning a trip! 🎉**
