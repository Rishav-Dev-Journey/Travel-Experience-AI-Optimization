const INTEREST_SUGGESTIONS = {
  Beach: { dest: "Goa", tag: "Beach getaway", color: "text-cyan-200", bg: "bg-cyan-300/10 border-cyan-300/25" },
  Mountains: { dest: "Manali", tag: "Mountain escape", color: "text-blue-200", bg: "bg-blue-300/10 border-blue-300/25" },
  Culture: { dest: "Varanasi", tag: "Cultural immersion", color: "text-orange-200", bg: "bg-orange-300/10 border-orange-300/25" },
  Adventure: { dest: "Rishikesh", tag: "Adventure hub", color: "text-emerald-200", bg: "bg-emerald-300/10 border-emerald-300/25" },
  Food: { dest: "Mumbai", tag: "Food trail", color: "text-yellow-200", bg: "bg-yellow-300/10 border-yellow-300/25" },
  Wellness: { dest: "Kerala", tag: "Wellness retreat", color: "text-purple-200", bg: "bg-purple-300/10 border-purple-300/25" },
};

const BUDGET_LABEL = {
  Budget: { label: "Budget traveller", icon: "💸" },
  "Mid-range": { label: "Mid-range explorer", icon: "✈️" },
  Luxury: { label: "Luxury seeker", icon: "🌟" },
};

export default function Home({ profile, identifier, onEditProfile }) {
  const firstName = profile.name ? profile.name.split(" ")[0] : null;
  const suggestions = profile.interests.slice(0, 3).map((i) => INTEREST_SUGGESTIONS[i]).filter(Boolean);
  const budgetInfo = BUDGET_LABEL[profile.budget];

  return (
    <div className="animate-floatIn">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-widest text-cyan-300">AI Travel Workspace</p>
          <h2 className="mt-1 font-display text-2xl text-white">
            {firstName ? `Welcome back, ${firstName} 👋` : "Welcome Aboard 🎉"}
          </h2>
          <p className="mt-1 text-sm text-slate-400">{identifier}</p>
        </div>
        <button
          type="button"
          onClick={onEditProfile}
          className="shrink-0 rounded-xl border border-white/15 bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-300 transition hover:border-white/30 hover:text-white"
        >
          Edit Profile
        </button>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {profile.homeCity ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Home base</p>
            <p className="mt-1 text-sm font-semibold text-white">{profile.homeCity}</p>
          </div>
        ) : null}
        {budgetInfo ? (
          <div className="rounded-xl border border-white/10 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Budget</p>
            <p className="mt-1 text-sm font-semibold text-white">{budgetInfo.icon} {budgetInfo.label}</p>
          </div>
        ) : null}
        {profile.interests.length > 0 ? (
          <div className="col-span-2 rounded-xl border border-white/10 bg-slate-900/50 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500">Interests</p>
            <div className="mt-1.5 flex flex-wrap gap-1">
              {profile.interests.map((i) => (
                <span key={i} className="rounded-lg bg-white/10 px-2 py-0.5 text-xs text-slate-200">{i}</span>
              ))}
            </div>
          </div>
        ) : null}
      </div>

      {suggestions.length > 0 ? (
        <div className="mt-5">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">AI Suggestions for you</p>
          <div className="mt-2 grid gap-2">
            {suggestions.map(({ dest, tag, color, bg }) => (
              <div key={dest} className={`flex items-center justify-between rounded-xl border p-3 ${bg}`}>
                <div>
                  <p className={`text-sm font-semibold ${color}`}>{dest}</p>
                  <p className="text-xs text-slate-400">{tag}</p>
                </div>
                <span className="text-xs text-slate-500">AI pick →</span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="mt-5 rounded-xl border border-white/10 bg-slate-900/40 p-4 text-center">
          <p className="text-sm text-slate-400">Complete your profile to get AI-powered travel suggestions.</p>
          <button
            type="button"
            onClick={onEditProfile}
            className="mt-3 inline-flex h-9 items-center justify-center rounded-xl bg-cyan-300/15 px-4 text-xs font-semibold text-cyan-200 transition hover:bg-cyan-300/25"
          >
            Set up profile
          </button>
        </div>
      )}

      <div className="mt-4 rounded-xl border border-white/10 bg-slate-900/40 p-3 text-center">
        <p className="text-xs text-slate-500">Full itinerary planner & booking coming soon</p>
      </div>
    </div>
  );
}
