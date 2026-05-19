import ChatBot from "./ChatBot";
import TripPlanner from "./TripPlanner";
import DestinationDetail from "./DestinationDetail";
import AIItinerary from "./AIItinerary";
import ItineraryDisplay from "./ItineraryDisplay";
import { useState, useEffect } from "react";

const INTEREST_SUGGESTIONS = {
  Beach: { dest: "Goa", tag: "Beach getaway", desc: "Sun, sand & seafood on India's favourite coast", color: "text-cyan-200", bg: "bg-cyan-300/10 border-cyan-300/25", emoji: "🏖️" },
  Mountains: { dest: "Manali", tag: "Mountain escape", desc: "Snow peaks, river valleys & adventure trails", color: "text-blue-200", bg: "bg-blue-300/10 border-blue-300/25", emoji: "🏔️" },
  Culture: { dest: "Varanasi", tag: "Cultural immersion", desc: "Ancient ghats, temples & spiritual heritage", color: "text-orange-200", bg: "bg-orange-300/10 border-orange-300/25", emoji: "🏛️" },
  Adventure: { dest: "Rishikesh", tag: "Adventure hub", desc: "Rafting, bungee & yoga in the Himalayas", color: "text-emerald-200", bg: "bg-emerald-300/10 border-emerald-300/25", emoji: "🧗" },
  Food: { dest: "Mumbai", tag: "Food trail", desc: "Street food, fine dining & coastal flavours", color: "text-yellow-200", bg: "bg-yellow-300/10 border-yellow-300/25", emoji: "🍜" },
  Wellness: { dest: "Kerala", tag: "Wellness retreat", desc: "Ayurveda, backwaters & serene hill stations", color: "text-purple-200", bg: "bg-purple-300/10 border-purple-300/25", emoji: "🧘" },
};

const BUDGET_LABEL = {
  Budget: { label: "Budget traveller", icon: "💸" },
  "Mid-range": { label: "Mid-range explorer", icon: "✈️" },
  Luxury: { label: "Luxury seeker", icon: "🌟" },
};

const QUICK_ACTIONS = [
  { label: "Plan a Trip", icon: "🗺️", soon: true },
  { label: "Find Flights", icon: "✈️", soon: true },
  { label: "Book a Stay", icon: "🏨", soon: true },
  { label: "AI Itinerary", icon: "🤖", soon: true },
];

export default function Home({ profile, identifier, onEditProfile, onLogout, onFetchRecommendations, onGenerateItinerary, onFetchRecentItineraries }) {
  const firstName = profile.name ? profile.name.split(" ")[0] : null;
  const budgetInfo = BUDGET_LABEL[profile.budget];
  const [plannerOpen, setPlannerOpen] = useState(false);
  const [tripForm, setTripForm] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [searching, setSearching] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [recommendationEngine, setRecommendationEngine] = useState(null);
  const [selectedDestination, setSelectedDestination] = useState(null);
  const [itineraryModalOpen, setItineraryModalOpen] = useState(false);
  const [generatedItinerary, setGeneratedItinerary] = useState(null);
  const [recentItineraries, setRecentItineraries] = useState([]);

  // Load AI suggestions based on profile on mount
  useEffect(() => {
    console.log('🌟 Profile interests:', profile.interests);
    if (!profile.interests?.length) return;
    const budgetMap = { Budget: [5000, 30000], "Mid-range": [10000, 60000], Luxury: [30000, 150000] };
    const [bMin, bMax] = budgetMap[profile.budget] ?? [5000, 150000];
    console.log('💰 Fetching AI suggestions with budget:', bMin, '-', bMax);
    onFetchRecommendations({
      sourceCity: profile.homeCity || "Delhi",
      budgetMin: bMin,
      budgetMax: bMax,
      startDate: new Date().toISOString().split("T")[0],
      days: 5,
      numberOfPeople: "1",
      interests: profile.interests,
      transport: ["air", "train", "road", "bus"],
    }).then((response) => {
      console.log('✨ AI Suggestions response:', response);
      console.log('✨ AI Suggestions results:', response.results);
      setAiSuggestions(response.results || []);
    });
  }, [profile.interests?.join(","), profile.budget]);

  // Load recent itineraries
  useEffect(() => {
    if (!onFetchRecentItineraries) return;
    onFetchRecentItineraries().then(setRecentItineraries).catch(() => {});
  }, []);

  async function handleGenerateItinerary(request) {
    const itinerary = await onGenerateItinerary(request);
    if (itinerary) {
      setGeneratedItinerary(itinerary);
      setItineraryModalOpen(false);
      if (onFetchRecentItineraries) {
        onFetchRecentItineraries().then(setRecentItineraries).catch(() => {});
      }
    }
  }

  async function handleSearch(form) {
    console.log('🔍 handleSearch called with:', form);
    setTripForm(form);
    setPlannerOpen(false);
    setSearching(true);
    setRecommendations([]);
    setRecommendationEngine(null);
    const results = await onFetchRecommendations(form);
    console.log('📊 API Response:', results);
    console.log('📊 Results array:', results.results);
    console.log('📊 Engine:', results.engine);
    setRecommendations(results.results || results);
    setRecommendationEngine(results.engine || null);
    setSearching(false);
  }

  return (
    <div className="relative min-h-screen overflow-x-hidden">

      {/* Background */}
      <div className="pointer-events-none fixed inset-0 z-0">
        <div className="home-bg" aria-hidden="true" />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/60 via-slate-950/40 to-slate-950/85" />
        <div className="absolute left-[-9rem] top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulseSoft" />
        <div className="absolute bottom-6 right-[-8rem] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl animate-pulseSoft" />
      </div>

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4 md:px-10">
        {/* Animated Travel.AI logo — top left */}
        <div className="home-logo flex items-center gap-1.5">
          <span className="home-logo-icon text-xl">✈️</span>
          <span className="font-display text-xl font-bold tracking-tight text-white">
            Travel<span className="home-logo-ai text-cyan-300">.AI</span>
          </span>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden text-xs text-slate-400 sm:block">{identifier}</span>
          <button
            type="button"
            onClick={onEditProfile}
            className="rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
          >
            Edit Profile
          </button>
          <button
            type="button"
            onClick={onLogout}
            className="rounded-xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-300 transition hover:bg-red-400/20 hover:text-red-200"
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16 md:px-10">
        {/* Hero greeting */}
        <div className="mt-4">
          <p className="text-xs uppercase tracking-widest text-cyan-300">AI Travel Workspace</p>
          <h1 className="mt-2 font-display text-3xl text-white md:text-4xl">
            {firstName ? `Welcome back, ${firstName} 👋` : "Welcome Aboard 🎉"}
          </h1>
          <p className="mt-1 text-sm text-slate-400">Your personalised travel dashboard is ready.</p>
        </div>

        {/* Profile summary */}
        {(profile.homeCity || budgetInfo || profile.interests.length > 0) ? (
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {profile.homeCity ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Home base</p>
                <p className="mt-1 text-sm font-semibold text-white">📍 {profile.homeCity}</p>
              </div>
            ) : null}
            {budgetInfo ? (
              <div className="rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Budget</p>
                <p className="mt-1 text-sm font-semibold text-white">{budgetInfo.icon} {budgetInfo.label}</p>
              </div>
            ) : null}
            {profile.interests.length > 0 ? (
              <div className="col-span-2 rounded-2xl border border-white/10 bg-slate-900/50 p-4">
                <p className="text-[10px] uppercase tracking-widest text-slate-500">Interests</p>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {profile.interests.map((i) => (
                    <span key={i} className="rounded-lg bg-white/10 px-2.5 py-1 text-xs text-slate-200">{i}</span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="mt-6 rounded-2xl border border-dashed border-white/15 bg-slate-900/30 p-6 text-center">
            <p className="text-sm text-slate-400">Your profile is empty. Set it up to get AI-powered suggestions.</p>
            <button
              type="button"
              onClick={onEditProfile}
              className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-cyan-300/15 px-4 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/25"
            >
              Set up profile →
            </button>
          </div>
        )}

        {/* Quick actions */}
        <div className="mt-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Quick Actions</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <button
              type="button"
              onClick={() => setPlannerOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-cyan-300/30 bg-cyan-300/10 p-4 transition hover:bg-cyan-300/20"
            >
              <span className="text-2xl">🗺️</span>
              <span className="text-xs font-semibold text-cyan-200">Plan a Trip</span>
              <span className="rounded-full bg-cyan-300/20 px-2 py-0.5 text-[10px] text-cyan-300">AI Powered</span>
            </button>
            <button
              type="button"
              onClick={() => setItineraryModalOpen(true)}
              className="flex flex-col items-center gap-2 rounded-2xl border border-purple-300/30 bg-purple-300/10 p-4 transition hover:bg-purple-300/20"
            >
              <span className="text-2xl">🤖</span>
              <span className="text-xs font-semibold text-purple-200">AI Itinerary</span>
              <span className="rounded-full bg-purple-300/20 px-2 py-0.5 text-[10px] text-purple-300">AI Powered</span>
            </button>
            {QUICK_ACTIONS.slice(1, 3).map(({ label, icon }) => (
              <div key={label} className="flex flex-col items-center gap-2 rounded-2xl border border-white/10 bg-slate-900/50 p-4 opacity-50">
                <span className="text-2xl">{icon}</span>
                <span className="text-xs font-semibold text-slate-300">{label}</span>
                <span className="rounded-full bg-slate-700/60 px-2 py-0.5 text-[10px] text-slate-400">Coming soon</span>
              </div>
            ))}
          </div>
        </div>

        {/* Trip results */}
        {searching ? (
          <div className="mt-6 flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-900/40 p-5">
            <div className="h-5 w-5 animate-spin rounded-full border-2 border-cyan-300 border-t-transparent" />
            <p className="text-sm text-slate-400">🤖 AI is analyzing destinations for you...</p>
          </div>
        ) : recommendations.length > 0 ? (
          <div className="mt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <p className="text-xs font-semibold uppercase tracking-widest text-cyan-300">
                  {recommendationEngine === 'ai' ? '🤖 AI-Powered' : '📊 Smart'} Recommendations — {tripForm?.sourceCity} · {tripForm?.days} days · {tripForm?.numberOfPeople} {tripForm?.numberOfPeople === "1" ? "person" : "people"}
                </p>
                {recommendationEngine === 'ai' && (
                  <span className="rounded-full bg-cyan-300/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-300">AWS Bedrock</span>
                )}
              </div>
              <button type="button" onClick={() => setPlannerOpen(true)} className="text-[10px] text-slate-400 hover:text-white">Modify →</button>
            </div>
            <div className="mt-3 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {recommendations.map((r, i) => (
                <div 
                  key={r.id} 
                  className="relative rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden hover:border-cyan-300/30 transition cursor-pointer"
                  onClick={() => setSelectedDestination(r)}
                >
                  <img src={r.imageUrl} alt={r.name} className="h-36 w-full object-cover" />
                  <div className="absolute top-2 left-2 rounded-full bg-cyan-300 px-2 py-0.5 text-[10px] font-bold text-slate-900">#{i + 1} Match</div>
                  {recommendationEngine === 'ai' && (
                    <div className="absolute top-2 right-2 rounded-full bg-purple-500/90 px-2 py-0.5 text-[10px] font-bold text-white">AI Pick</div>
                  )}
                  <div className="p-4">
                    <p className="font-display text-base font-semibold text-white">{r.name}</p>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{r.description}</p>
                    {recommendationEngine === 'ai' && r.scoreBreakdown && (
                      <p className="mt-2 text-[10px] text-cyan-300 italic">💡 {r.scoreBreakdown}</p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-1">
                      {r.interests.map((tag) => (
                        <span key={tag} className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-3 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">🗓 {r.idealDaysMin}–{r.idealDaysMax} days</span>
                      <span className="text-emerald-400 font-semibold">₹{r.pricePerPerson?.toLocaleString()}/person</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px] text-slate-500">
                      <span>🚀 {r.availableTransport.join(", ")}</span>
                      <span className="text-cyan-400 font-semibold">Score {r.score}/100</span>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.highlights.slice(0, 3).map((h) => (
                        <span key={h} className="text-[10px] text-slate-500">• {h}</span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : tripForm ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900/40 p-5 text-center">
            <p className="text-sm text-slate-400">No destinations matched your criteria. Try adjusting budget or transport modes.</p>
            <button type="button" onClick={() => setPlannerOpen(true)} className="mt-3 text-xs text-cyan-300 hover:underline">Modify search →</button>
          </div>
        ) : null}

        {/* AI Suggestions based on profile */}
        <div className="mt-8">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              {profile.interests?.length > 0 ? "🤖 AI Picks Based on Your Profile" : "Popular Destinations"}
            </p>
            {profile.interests?.length === 0 ? (
              <button type="button" onClick={onEditProfile} className="text-[10px] text-cyan-300 hover:underline">Set interests →</button>
            ) : null}
          </div>

          {aiSuggestions.length > 0 ? (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {aiSuggestions.map((r) => (
                <div 
                  key={r.id} 
                  className="rounded-2xl border border-white/10 bg-slate-900/60 overflow-hidden cursor-pointer hover:border-cyan-300/30 transition"
                  onClick={() => setSelectedDestination(r)}
                >
                  <img src={r.imageUrl} alt={r.name} className="h-32 w-full object-cover" />
                  <div className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="font-display text-sm font-semibold text-white">{r.name}</p>
                      <span className="text-[10px] text-cyan-400 font-semibold">{r.score}/100</span>
                    </div>
                    <p className="mt-1 text-xs text-slate-400 line-clamp-2">{r.description}</p>
                    <div className="mt-2 flex flex-wrap gap-1">
                      {r.interests.map((tag) => (
                        <span key={tag} className="rounded-lg bg-white/10 px-2 py-0.5 text-[10px] text-slate-300">{tag}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center justify-between text-[10px]">
                      <span className="text-slate-500">🗓 {r.idealDaysMin}–{r.idealDaysMax} days</span>
                      <span className="text-emerald-400 font-semibold">₹{r.pricePerPerson?.toLocaleString()}/person</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : profile.interests?.length > 0 ? (
            <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
              <div className="h-3 w-3 animate-spin rounded-full border border-cyan-300 border-t-transparent" />
              Loading suggestions...
            </div>
          ) : (
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {Object.values(INTEREST_SUGGESTIONS).map(({ dest, tag, desc, color, bg, emoji }) => (
                <div key={dest} className={`rounded-2xl border p-4 ${bg}`}>
                  <div className="flex items-center justify-between">
                    <span className="text-xl">{emoji}</span>
                    <span className="text-[10px] uppercase tracking-widest text-slate-500">Popular</span>
                  </div>
                  <p className={`mt-2 font-display text-base font-semibold ${color}`}>{dest}</p>
                  <p className="text-xs text-slate-400">{tag}</p>
                  <p className="mt-1 text-xs leading-relaxed text-slate-500">{desc}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent AI Itineraries */}
        {recentItineraries.length > 0 && (
          <div className="mt-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">
              🗺️ Recent AI Itineraries
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {recentItineraries.map((itinerary) => (
                <div
                  key={itinerary.id}
                  className="rounded-2xl border border-white/10 bg-slate-900/60 p-4 cursor-pointer hover:border-purple-300/30 transition"
                >
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-display text-sm font-semibold text-white">{itinerary.destination}</p>
                    <span className="text-[10px] text-purple-400">{itinerary.totalDays} days</span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-2">{itinerary.overview}</p>
                  <p className="mt-2 text-[10px] text-slate-500">
                    {new Date(itinerary.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      <ChatBot profile={profile} />
      {plannerOpen ? (
        <TripPlanner
          profile={profile}
          onSearch={handleSearch}
          onClose={() => setPlannerOpen(false)}
        />
      ) : null}
      {selectedDestination ? (
        <DestinationDetail
          destination={selectedDestination}
          numberOfPeople={parseInt(tripForm?.numberOfPeople || "1")}
          onClose={() => setSelectedDestination(null)}
        />
      ) : null}
      {itineraryModalOpen ? (
        <AIItinerary
          onClose={() => setItineraryModalOpen(false)}
          onGenerate={handleGenerateItinerary}
        />
      ) : null}
      {generatedItinerary ? (
        <ItineraryDisplay
          itinerary={generatedItinerary}
          onClose={() => setGeneratedItinerary(null)}
        />
      ) : null}
    </div>
  );
}
