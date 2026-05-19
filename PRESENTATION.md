# Travel Experience AI — Project Presentation

---

## Slide 1 — Product Overview

### 🧠 Smart Travel Advisor
> *"An AI-powered travel advisor that recommends destinations based on user preferences, enriches them with real-world context, and generates complete travel plans including transport options and day-wise itineraries."*

---

### What It Does

| Feature | Description |
|---|---|
| 🔐 Secure Auth | OTP-based email login — no passwords |
| 👤 Smart Profile | Interests, budget, home city drive all AI decisions |
| 🤖 AI Suggestions | GPT-4o-mini powered destination picks based on profile |
| 🗺️ Trip Planner | Budget, dates, duration, transport → Top 5 AI recommendations |
| 📊 Scoring Engine | Multi-factor: budget fit, interest match, season, duration, transport |
| 💬 Travel Chatbot | Floating AI assistant for trip planning queries |

---

### Target Users
- Solo travellers & weekend explorers
- Budget-conscious trip planners
- Users who want AI to do the heavy lifting

---

## Slide 2 — System Design (HLD)

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (React + Vite)                    │
│                                                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────────┐  ┌───────────┐  │
│  │ Auth Flow│  │ Profile  │  │ Trip Planner │  │  ChatBot  │  │
│  │Email+OTP │  │ Setup    │  │ Input Form   │  │  (GPT UI) │  │
│  └────┬─────┘  └────┬─────┘  └──────┬───────┘  └─────┬─────┘  │
└───────┼─────────────┼───────────────┼────────────────┼─────────┘
        │             │               │                │
        ▼             ▼               ▼                ▼
┌─────────────────────────────────────────────────────────────────┐
│                   REST API (.NET 8 Minimal API)                 │
│                                                                 │
│  /api/auth/request-otp    /api/auth/verify-otp                 │
│  /api/profile (GET/PUT)   /api/recommendations (POST)          │
│  /api/suggestions (GET)   ← GPT-4o-mini cached                 │
└──────────────┬──────────────────────────┬───────────────────────┘
               │                          │
       ┌───────▼────────┐      ┌──────────▼──────────┐
       │  PostgreSQL DB  │      │  Azure OpenAI       │
       │                │      │  GPT-4o-mini        │
       │ auth_users     │      │                     │
       │ otp_challenges │      │  Prompt: profile    │
       │ user_sessions  │      │  → JSON suggestions │
       │ user_profiles  │      │  cached 10 days     │
       │ destinations   │      └─────────────────────┘
       │ ai_suggestions │
       └────────────────┘
```

---

### Key Design Decisions

| Decision | Reason |
|---|---|
| OTP Auth (no passwords) | Simpler UX, no password reset flows |
| DB-backed sessions | Survives API restarts, multi-device support |
| 3-day idle timeout | Security without annoying re-logins |
| GPT suggestions cached 10 days | Cost control — only refresh on profile change |
| Scoring engine in C# | Fast, testable, no AI cost for recommendations |
| localStorage persistence | Page refresh doesn't lose session |

---

## Slide 3 — Database Schema

```
auth_users
├── id (uuid PK)
├── identifier (email)
├── channel (email/mobile)
├── created_at
└── last_login_at

user_sessions
├── token (PK)
├── user_id → auth_users
├── expires_at
└── created_at

user_profiles
├── user_id (PK) → auth_users
├── name
├── home_city
├── budget (Budget/Mid-range/Luxury)
├── interests (text[])
└── updated_at

destinations
├── id (uuid PK)
├── name, country, description
├── image_url
├── interests (text[])
├── budget_min, budget_max
├── ideal_days_min, ideal_days_max
├── best_months (int[])
├── transport_modes (text[])
└── highlights (text[])

ai_suggestions          ← NEXT
├── user_id → auth_users
├── suggestions (jsonb)
├── profile_hash
└── generated_at

otp_challenges
├── challenge_id (unique)
├── user_id → auth_users
├── code_hash
├── expires_at
└── consumed_at
```

---

## Slide 4 — What's Completed

### ✅ Done (100%)

#### 🔐 Authentication
- [x] OTP request via Azure Communication Services (email)
- [x] OTP verify with challenge/response pattern
- [x] DB-backed sessions (`user_sessions` table)
- [x] New vs returning user detection
- [x] 3-day idle timeout with activity tracking
- [x] localStorage persistence — survives page refresh
- [x] 401 handling → auto logout on stale token

#### 👤 Profile Management
- [x] Profile setup on first login (name, home city, budget, interests)
- [x] Skip option with redirect to home
- [x] Save to DB via `PUT /api/profile`
- [x] Fetch from DB on returning login
- [x] Edit profile from home page
- [x] Profile change reflected immediately

#### 🏠 Home Dashboard
- [x] Full-page home with mountain background
- [x] Animated Travel.AI logo
- [x] Profile summary cards
- [x] Logout button
- [x] Edit Profile button

#### 🗺️ Trip Planner
- [x] Input form — source city, budget range, dates, duration, transport, interests
- [x] Form validation
- [x] Modal UI with backdrop

#### 🤖 Recommendation Engine
- [x] 12 destinations seeded in DB
- [x] Multi-factor scoring (budget, interests, season, duration, transport)
- [x] Hard filters (budget overlap, transport feasibility)
- [x] `POST /api/recommendations` endpoint
- [x] Result cards with image, score, highlights, transport

#### 💬 Chatbot
- [x] Floating chat button (bottom-right)
- [x] Chat panel with typing indicator
- [x] Quick suggestion chips
- [x] Mock AI responses based on profile interests

#### 🏗️ Infrastructure
- [x] 5 DB migrations (auth_users, otp_challenges, user_profiles, user_sessions, destinations)
- [x] Component-based React architecture (AuthEmail, AuthOtp, ProfileSetup, Home, TripPlanner, ChatBot)
- [x] Tailwind CSS + custom animations
- [x] CORS configured for local dev

---

### 🔄 In Progress (50%)

- [ ] AI Suggestions via GPT-4o-mini (schema ready, API pending)
- [ ] `ai_suggestions` cache table (design done, not built)
- [ ] Popular Destinations — dynamic from DB based on profile

---

### ⏳ Pending (0%)

- [ ] Experience Cards — full detail view per destination
- [ ] Azure OpenAI integration
- [ ] AQI / crowd / traffic real-world data
- [ ] Amadeus flight API integration
- [ ] Day-wise itinerary generation
- [ ] Caching layer for flight data
- [ ] Collaborative filtering

---

## Slide 5 — Progress & Roadmap

### 📊 Overall Completion

```
Authentication          ████████████████████  100%
Profile Management      ████████████████████  100%
Home Dashboard          ████████████████████  100%
Trip Planner UI         ████████████████████  100%
Recommendation Engine   ████████████████████  100%
DB Migrations           ████████████████████  100%
Component Architecture  ████████████████████  100%
Session Management      ████████████████████  100%
─────────────────────────────────────────────────
AI Suggestions (GPT)    ██████░░░░░░░░░░░░░░   30%
Experience Cards UI     ████░░░░░░░░░░░░░░░░   20%
─────────────────────────────────────────────────
Itinerary Generation    ░░░░░░░░░░░░░░░░░░░░    0%
Flight API (Amadeus)    ░░░░░░░░░░░░░░░░░░░░    0%
AQI / Context Data      ░░░░░░░░░░░░░░░░░░░░    0%
Caching Layer           ░░░░░░░░░░░░░░░░░░░░    0%

OVERALL PROJECT         ████████████░░░░░░░░   58%
```

---

### 🗓️ Remaining Roadmap

| Phase | Feature | Effort |
|---|---|---|
| **Phase 2** | Azure OpenAI GPT-4o-mini integration | 1 day |
| **Phase 2** | AI suggestions cache (`ai_suggestions` table) | 0.5 day |
| **Phase 2** | Experience Cards full detail view | 1 day |
| **Phase 3** | AQI + crowd + traffic APIs | 1 day |
| **Phase 3** | Amadeus flight search API | 1.5 days |
| **Phase 3** | Day-wise itinerary generation (GPT) | 1 day |
| **Phase 4** | Flight data caching layer | 0.5 day |
| **Phase 4** | Collaborative filtering | 2 days |

---

### 🔥 Tech Stack Summary

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, Tailwind CSS |
| Backend | .NET 8, C#, Minimal API |
| Database | PostgreSQL (Npgsql) |
| Auth | OTP via Azure Communication Services |
| AI | Azure OpenAI GPT-4o-mini *(next)* |
| Hosting | Azure *(planned)* |
| Version Control | GitHub (develop branch) |
