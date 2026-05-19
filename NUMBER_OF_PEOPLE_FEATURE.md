# ✅ Number of People Field Added

## Summary

Added "Number of People" field to the trip planning form. This field is now included in:
- Frontend form
- API request/response
- AI prompt for better recommendations
- Display in results header

---

## Changes Made

### 1. Frontend (React)

#### TripPlanner.jsx
- Added `numberOfPeople` to form state (default: "1")
- Added input field with validation (min: 1, max: 20)
- Included in form validation

#### App.jsx
- Added `numberOfPeople` to API request payload
- Parses as integer before sending

#### Home.jsx
- Displays number of people in recommendations header
- Shows "1 person" or "X people" based on count
- Included in initial AI suggestions call

### 2. Backend (.NET API)

#### Program.cs
- Added `NumberOfPeople` to `RecommendationRequest` record
- Field is required (int type)

#### BedrockRecommendationService.cs
- Included `NumberOfPeople` in AI prompt
- Claude 3 now considers group size for recommendations

---

## UI Changes

### Trip Planner Form
```
┌─────────────────────────────────┐
│ Source City: [Delhi          ]  │
│ Budget: [10000] — [50000]       │
│ Start Date: [2024-07-01]        │
│ Duration: [5] days              │
│ Number of People: [2]  ← NEW    │
│ Transport: ✈️ 🚆                │
│ Interests: 🏖️ 🧗               │
└─────────────────────────────────┘
```

### Results Header
```
🤖 AI-Powered Recommendations — Delhi · 5 days · 2 people
                                                  ↑ NEW
```

---

## API Request Example

```json
{
  "sourceCity": "Delhi",
  "budgetMin": 10000,
  "budgetMax": 50000,
  "startDate": "2024-07-01",
  "days": 5,
  "numberOfPeople": 2,
  "interests": ["Beach", "Adventure"],
  "transportModes": ["air", "train"]
}
```

---

## AI Prompt Enhancement

The AI now receives:
```
USER PREFERENCES:
- Source City: Delhi
- Budget Range: $10000 - $50000
- Travel Start Date: 2024-07-01 (Month: 7)
- Duration: 5 days
- Number of People: 2  ← NEW
- Interests: Beach, Adventure
- Transport Modes: air, train
```

This helps Claude 3 provide better recommendations considering:
- Group-friendly destinations
- Budget per person vs total
- Accommodation suitability
- Activity feasibility for groups

---

## Testing

### Via Web UI
1. Open http://localhost:5173
2. Sign in and click "Plan a Trip"
3. Fill form including "Number of People"
4. Submit and check results

### Via API
```bash
./test-recommendations-api.sh
```

The script now includes `numberOfPeople: 2` in the test request.

---

## Files Modified

```
apps/web/src/
├── components/TripPlanner.jsx  (form field added)
├── components/Home.jsx         (display updated)
└── App.jsx                     (API call updated)

apps/api/
├── Program.cs                  (model updated)
└── BedrockRecommendationService.cs (prompt updated)

test-recommendations-api.sh     (test updated)
```

---

## Validation

- **Min**: 1 person
- **Max**: 20 people
- **Default**: 1 person
- **Required**: Yes (form won't submit without it)

---

## Benefits

1. **Better AI Recommendations**: Claude considers group size
2. **Budget Context**: AI understands if budget is per person or total
3. **Group Suitability**: Recommends destinations suitable for groups
4. **User Experience**: Clear indication of trip size in results

---

## Next Steps

To use the feature:
1. **Restart API**: `cd apps/api && dotnet run`
2. **Restart Web**: `cd apps/web && npm run dev`
3. **Test**: Fill the trip form with number of people

---

✅ Feature complete and ready to use!
