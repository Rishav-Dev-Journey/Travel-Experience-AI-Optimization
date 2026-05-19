# Travel Experience AI — System Design Document
## High Level Design (HLD) + Low Level Design (LLD)

---

# PART 1 — HIGH LEVEL DESIGN (HLD)

---

## 1.1 System Overview

Travel Experience AI is a full-stack web application that provides personalised travel destination recommendations using a multi-factor scoring engine and GPT-4o-mini AI. Users authenticate via OTP, set up a travel profile, and receive AI-curated destination suggestions with trip planning capabilities.

---

## 1.2 Architecture Diagram

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          USER'S BROWSER                                  │
│                                                                          │
│   ┌─────────────┐   ┌──────────────┐   ┌─────────────┐   ┌──────────┐  │
│   │  Auth Flow  │   │   Profile    │   │    Home     │   │  Trip    │  │
│   │  Email+OTP  │   │   Setup      │   │  Dashboard  │   │ Planner  │  │
│   └──────┬──────┘   └──────┬───────┘   └──────┬──────┘   └────┬─────┘  │
│          │                 │                   │               │        │
│          └─────────────────┴───────────────────┴───────────────┘        │
│                                     │                                    │
│                          React 18 + Vite + Tailwind                      │
│                          localStorage (session cache)                    │
└─────────────────────────────────────┬────────────────────────────────────┘
                                      │ HTTPS REST (Bearer Token)
                                      ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                        .NET 8 MINIMAL API                                │
│                                                                          │
│  ┌──────────────────┐  ┌─────────────────┐  ┌────────────────────────┐  │
│  │   Auth Layer     │  │  Profile Layer  │  │  Recommendation Layer  │  │
│  │                  │  │                 │  │                        │  │
│  │ POST /request-otp│  │ GET  /profile   │  │ POST /recommendations  │  │
│  │ POST /verify-otp │  │ PUT  /profile   │  │ GET  /suggestions      │  │
│  └────────┬─────────┘  └────────┬────────┘  └───────────┬────────────┘  │
│           │                     │                        │               │
│  ┌────────▼─────────────────────▼────────────────────────▼────────────┐  │
│  │                    PostgresAuthStore (Npgsql)                      │  │
│  │              RecommendationEngine (C# Scoring)                     │  │
│  │              OtpAuthService (Challenge/Response)                   │  │
│  └────────────────────────────────────────────────────────────────────┘  │
└──────────────────────────────┬───────────────────────────────────────────┘
                               │
              ┌────────────────┼────────────────────┐
              ▼                ▼                    ▼
┌─────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
│   PostgreSQL    │  │  Azure Comm.     │  │  Azure OpenAI        │
│                 │  │  Services        │  │  GPT-4o-mini         │
│  auth_users     │  │                 │  │                      │
│  otp_challenges │  │  Email OTP      │  │  Profile → JSON      │
│  user_sessions  │  │  Delivery       │  │  Suggestions         │
│  user_profiles  │  │                 │  │  (cached 10 days)    │
│  destinations   │  └──────────────────┘  └──────────────────────┘
│  ai_suggestions │
└─────────────────┘
```

---

## 1.3 Component Breakdown

### Frontend (React 18 + Vite)

| Component | Responsibility |
|---|---|
| `App.jsx` | State management, API calls, step routing |
| `AuthEmail.jsx` | Email input form |
| `AuthOtp.jsx` | OTP verification with copy button |
| `ProfileSetup.jsx` | First-time profile setup (name, city, budget, interests) |
| `Home.jsx` | Dashboard — profile summary, AI picks, quick actions |
| `TripPlanner.jsx` | Trip input modal (budget, dates, transport, interests) |
| `ChatBot.jsx` | Floating AI chat assistant |

### Backend (.NET 8 Minimal API)

| Service | Responsibility |
|---|---|
| `OtpAuthService` | OTP generation, hashing, challenge lifecycle |
| `PostgresAuthStore` | All DB operations (users, sessions, profiles, destinations) |
| `RecommendationEngine` | Multi-factor scoring algorithm |
| `AzureEmailOtpSender` | OTP delivery via Azure Communication Services |

---

## 1.4 Data Flow — Authentication

```
Browser                    API                    PostgreSQL         Azure Comm.
   │                        │                         │                  │
   │── POST /request-otp ──►│                         │                  │
   │                        │── UpsertUser ──────────►│                  │
   │                        │── InsertChallenge ──────►│                  │
   │                        │── SendOtp ──────────────────────────────►  │
   │◄── { challengeId,      │                         │                  │
   │      demoOtp(dev) } ───│                         │                  │
   │                        │                         │                  │
   │── POST /verify-otp ───►│                         │                  │
   │                        │── TryConsumeChallenge ─►│                  │
   │                        │   (check last_login_at) │                  │
   │                        │── StoreSession ─────────►│                  │
   │◄── { token,            │                         │                  │
   │      isNewUser } ──────│                         │                  │
```

---

## 1.5 Data Flow — Recommendations

```
Browser                    API                    PostgreSQL
   │                        │                         │
   │── POST /recommendations►│                         │
   │   { sourceCity,        │── ResolveSession ──────►│
   │     budgetMin/Max,     │◄── userId ──────────────│
   │     startDate,         │                         │
   │     days,              │── GetAllDestinations ──►│
   │     interests[],       │◄── destinations[] ──────│
   │     transportModes[] } │                         │
   │                        │   RecommendationEngine  │
   │                        │   .Score(destinations,  │
   │                        │     request, month)     │
   │                        │   → top 5 scored        │
   │◄── { results[] } ──────│                         │
```

---

## 1.6 Session Management

```
Login Success
     │
     ▼
Store token in PostgreSQL (user_sessions)
Store token in localStorage (te_token)
Store last_active timestamp (te_last_active)
     │
     ▼
On every user activity (mousemove/keydown/scroll)
     │
     ├── Update te_last_active in localStorage
     └── Reset 3-day idle timer (setTimeout)
                    │
                    ▼ (after 3 days idle)
              logout() called
              clearSession() → removes all localStorage keys
              Redirect to email step
```

---

# PART 2 — LOW LEVEL DESIGN (LLD)

---

## 2.1 Database Schema (Complete)

### `auth_users`
```sql
CREATE TABLE auth_users (
  id           UUID PRIMARY KEY,
  identifier   TEXT NOT NULL,          -- email address
  channel      TEXT NOT NULL,          -- 'email' | 'mobile'
  created_at   TIMESTAMPTZ NOT NULL,
  last_login_at TIMESTAMPTZ NULL,      -- NULL = new user
  UNIQUE(identifier, channel)
);
```

### `otp_challenges`
```sql
CREATE TABLE otp_challenges (
  id           UUID PRIMARY KEY,
  challenge_id TEXT NOT NULL UNIQUE,   -- sent to client
  user_id      UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  identifier   TEXT NOT NULL,
  channel      TEXT NOT NULL,
  code_hash    TEXT NOT NULL,          -- SHA256(challengeId:code)
  created_at   TIMESTAMPTZ NOT NULL,
  expires_at   TIMESTAMPTZ NOT NULL,   -- 5 min TTL
  consumed_at  TIMESTAMPTZ NULL        -- NULL = not yet used
);
INDEX: ix_otp_challenges_identifier_channel
```

### `user_sessions`
```sql
CREATE TABLE user_sessions (
  token      TEXT PRIMARY KEY,         -- base64(Guid)
  user_id    UUID NOT NULL REFERENCES auth_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,     -- 8 hours from login
  created_at TIMESTAMPTZ NOT NULL
);
INDEX: ix_user_sessions_user_id
```

### `user_profiles`
```sql
CREATE TABLE user_profiles (
  user_id   UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  name      TEXT NULL,
  home_city TEXT NULL,
  budget    TEXT NULL,                 -- 'Budget' | 'Mid-range' | 'Luxury'
  interests TEXT[] NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL
);
```

### `destinations`
```sql
CREATE TABLE destinations (
  id             UUID PRIMARY KEY,
  name           TEXT NOT NULL,
  country        TEXT NOT NULL DEFAULT 'India',
  description    TEXT NOT NULL,
  image_url      TEXT NOT NULL,
  interests      TEXT[] NOT NULL DEFAULT '{}',
  budget_min     INTEGER NOT NULL,     -- INR
  budget_max     INTEGER NOT NULL,     -- INR
  ideal_days_min INTEGER NOT NULL,
  ideal_days_max INTEGER NOT NULL,
  best_months    INTEGER[] NOT NULL DEFAULT '{}',  -- 1-12
  transport_modes TEXT[] NOT NULL DEFAULT '{}',
  highlights     TEXT[] NOT NULL DEFAULT '{}'
);
```

### `ai_suggestions` *(planned)*
```sql
CREATE TABLE ai_suggestions (
  user_id       UUID PRIMARY KEY REFERENCES auth_users(id) ON DELETE CASCADE,
  suggestions   JSONB NOT NULL,        -- GPT response
  profile_hash  TEXT NOT NULL,         -- MD5(interests+budget+homeCity)
  generated_at  TIMESTAMPTZ NOT NULL
);
-- Refresh when: profile_hash changes OR generated_at < NOW() - INTERVAL '10 days'
```

---

## 2.2 OTP Authentication — LLD

### OTP Code Security
```
code        = RandomNumberGenerator.GetInt32(100000, 1000000)  // 6-digit
code_hash   = SHA256( challengeId + ":" + code )               // stored in DB
```
- Raw OTP never stored in DB
- Hash includes `challengeId` to prevent rainbow table attacks
- Challenge consumed atomically on first use (`consumed_at` set)

### New User Detection
```
Step 1: Read last_login_at BEFORE update
        SELECT last_login_at FROM auth_users WHERE id = @user_id

Step 2: isNewUser = (last_login_at IS NULL)

Step 3: UPDATE auth_users SET last_login_at = @now WHERE id = @user_id
```

### Token Generation
```
token = Convert.ToBase64String(Guid.NewGuid().ToByteArray())
      = 24-char base64 string
      = stored in user_sessions with 8-hour expiry
```

---

## 2.3 Recommendation Engine — LLD

### Scoring Algorithm

```
Input:  destinations[] from DB
        request { sourceCity, budgetMin, budgetMax, startDate,
                  days, interests[], transportModes[] }
        travelMonth (1-12, derived from startDate)

For each destination:

  HARD FILTERS (skip if fails):
  ├── Budget overlap: dest.budgetMin <= req.budgetMax
  │                  AND dest.budgetMax >= req.budgetMin
  └── Transport: dest.transportModes ∩ req.transportModes ≠ ∅

  SCORING:
  ├── Budget fit       → +25 pts  (always if passed hard filter)
  ├── Interest match   → +10 pts per match, max 30 pts
  ├── Season fit       → +20 pts (best month match)
  │                    → +5 pts  (off-season)
  ├── Duration fit     → +15 pts (within ideal range)
  │                    → +7 pts  (1 day short)
  └── Transport        → +10 pts (at least one mode matches)

  MAX SCORE = 100 pts

Output: Top 5 destinations sorted by score DESC
```

### Score Breakdown Example
```
Goa (Beach, Nightlife, Food) — User wants Beach + Food, budget ₹15k, Jan, 5 days, Air+Train

  Budget fit:    ₹8k–₹50k overlaps ₹15k        → +25
  Interest match: Beach✓ Food✓ (2 matches)       → +20
  Season fit:    Jan = month 1, best_months has 1 → +20
  Duration fit:  5 days, ideal 3–7               → +15
  Transport:     Air✓ Train✓                     → +10
                                              ─────────
  TOTAL SCORE:                                    90/100
```

---

## 2.4 Frontend State Machine

```
                    ┌─────────┐
                    │  email  │◄──────────────────────────┐
                    └────┬────┘                           │
                         │ requestOtp()                   │
                         ▼                                │
                    ┌─────────┐                           │
                    │   otp   │                           │
                    └────┬────┘                           │
                         │ verifyOtp()                    │
                         ▼                                │
              ┌──────────────────────┐                    │
              │  isNewUser?          │                    │
              └──────┬───────┬───────┘                    │
                     │ yes   │ no                         │
                     ▼       ▼                            │
               ┌─────────┐ ┌──────┐                      │
               │ profile │ │ home │                      │
               └────┬────┘ └──────┘                      │
                    │ save / skip                         │
                    ▼                                     │
               ┌──────┐                                  │
               │ home │──── logout() ────────────────────┘
               └──────┘
```

### localStorage Keys
| Key | Value | Purpose |
|---|---|---|
| `te_token` | Bearer token string | Auth for API calls |
| `te_step` | `email\|otp\|profile\|home` | Restore last step on refresh |
| `te_profile` | JSON object | Avoid re-fetch on refresh |
| `te_identifier` | Email string | Pre-fill email on return |
| `te_last_active` | Unix timestamp | Idle timeout tracking |

---

## 2.5 API Contract

### POST `/api/auth/request-otp`
```json
Request:  { "identifier": "user@email.com", "channel": "email" }
Response: {
  "challengeId": "abc123",
  "expiresAt": "2025-01-01T10:05:00Z",
  "destination": "u***r@email.com",
  "demoOtp": "123456"   // dev only
}
```

### POST `/api/auth/verify-otp`
```json
Request:  { "challengeId": "abc123", "otp": "123456" }
Response: {
  "token": "base64token==",
  "user": { "identifier": "user@email.com", "channel": "email" },
  "isNewUser": true,
  "expiresAt": "2025-01-01T18:00:00Z"
}
```

### GET `/api/profile`
```json
Headers:  Authorization: Bearer <token>
Response: {
  "name": "Rishav",
  "homeCity": "Kolkata",
  "budget": "Mid-range",
  "interests": ["Beach", "Adventure"]
}
```

### PUT `/api/profile`
```json
Headers:  Authorization: Bearer <token>
Request:  { "name": "Rishav", "homeCity": "Kolkata",
            "budget": "Mid-range", "interests": ["Beach", "Adventure"] }
Response: { same as GET }
```

### POST `/api/recommendations`
```json
Headers:  Authorization: Bearer <token>
Request:  {
  "sourceCity": "Kolkata",
  "budgetMin": 10000,
  "budgetMax": 50000,
  "startDate": "2025-02-15",
  "days": 5,
  "interests": ["Beach", "Adventure"],
  "transportModes": ["air", "train"]
}
Response: {
  "total": 3,
  "results": [
    {
      "id": "uuid",
      "name": "Goa",
      "country": "India",
      "description": "...",
      "imageUrl": "https://...",
      "interests": ["Beach", "Nightlife", "Food"],
      "highlights": ["Baga Beach", "Dudhsagar Falls"],
      "availableTransport": ["air", "train"],
      "idealDaysMin": 3,
      "idealDaysMax": 7,
      "score": 90,
      "scoreBreakdown": "budget|interests(Beach)|season|duration|transport(air,train)"
    }
  ]
}
```

### GET `/api/suggestions` *(planned)*
```json
Headers:  Authorization: Bearer <token>
Response: {
  "suggestions": [
    {
      "destination": "Goa",
      "whyItFitsYou": "Perfect for your love of beaches and adventure...",
      "highlights": ["Beach", "Water Sports"],
      "bestTime": "November to February"
    }
  ],
  "generatedAt": "2025-01-01T00:00:00Z",
  "cachedUntil": "2025-01-11T00:00:00Z"
}
```

---

## 2.6 AI Suggestions Cache Strategy *(planned)*

```
GET /api/suggestions called
         │
         ▼
  Fetch ai_suggestions WHERE user_id = @userId
         │
         ├── Row exists?
         │       │
         │       ├── YES → Check profile_hash
         │       │           │
         │       │           ├── Hash matches current profile?
         │       │           │       │
         │       │           │       ├── YES → Check generated_at
         │       │           │       │           │
         │       │           │       │           ├── < 10 days old?
         │       │           │       │           │     └── Return cached ✅
         │       │           │       │           └── > 10 days old?
         │       │           │       │                 └── Refresh from GPT 🔄
         │       │           │       └── NO (profile changed)
         │       │           │               └── Refresh from GPT 🔄
         │       └── NO → Call GPT-4o-mini 🔄
         │
         ▼
  GPT-4o-mini Prompt:
  "User profile: interests=[Beach, Adventure], budget=Mid-range,
   home city=Kolkata. Suggest 5 Indian travel destinations as JSON:
   [{destination, whyItFitsYou, highlights[], bestTime}]"
         │
         ▼
  Store in ai_suggestions (user_id, suggestions, profile_hash, generated_at)
         │
         ▼
  Return to client ✅

profile_hash = MD5(interests.sort().join(",") + budget + homeCity)
```

---

## 2.7 Security Design

| Threat | Mitigation |
|---|---|
| OTP brute force | Challenge consumed on first use, 5-min expiry |
| Token theft | 8-hour expiry, DB-backed (can be revoked) |
| Session fixation | New token generated on every login |
| Stale sessions | 3-day idle timeout, 401 forces re-login |
| Secret exposure | `appsettings.Development.json` in `.gitignore` |
| CORS | Whitelist only known origins |
| SQL injection | Parameterised queries via Npgsql throughout |

---

## 2.8 Planned External Integrations

| API | Purpose | Caching |
|---|---|---|
| Azure OpenAI GPT-4o-mini | AI destination suggestions + itinerary | 10 days in DB |
| Amadeus Flight Search | Real flight options + pricing | 6–12 hrs in DB |
| OpenWeatherMap / WAQI | AQI data per destination | 6 hrs in DB |
| Google Maps / TomTom | Traffic + crowd level | 2 hrs in DB |

---

## 2.9 Deployment Architecture *(planned)*

```
┌─────────────────────────────────────────────────────┐
│                    Azure Cloud                      │
│                                                     │
│  ┌──────────────┐    ┌──────────────────────────┐   │
│  │ Azure Static │    │  Azure App Service       │   │
│  │ Web Apps     │    │  (.NET 8 API)            │   │
│  │              │    │                          │   │
│  │  React SPA   │───►│  /api/*                  │   │
│  └──────────────┘    └──────────┬───────────────┘   │
│                                 │                   │
│              ┌──────────────────┼──────────────┐    │
│              ▼                  ▼              ▼    │
│  ┌──────────────────┐  ┌──────────────┐  ┌───────┐  │
│  │ Azure Database   │  │ Azure OpenAI │  │ Azure │  │
│  │ for PostgreSQL   │  │ GPT-4o-mini  │  │ Comm. │  │
│  └──────────────────┘  └──────────────┘  └───────┘  │
└─────────────────────────────────────────────────────┘
```
