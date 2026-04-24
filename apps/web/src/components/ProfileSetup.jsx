const INTERESTS = [
  { label: "Beach", icon: "🏖️" },
  { label: "Mountains", icon: "🏔️" },
  { label: "Culture", icon: "🏛️" },
  { label: "Adventure", icon: "🧗" },
  { label: "Food", icon: "🍜" },
  { label: "Wellness", icon: "🧘" },
];

const BUDGETS = [
  { label: "Budget", icon: "💸", desc: "Hostels & street food" },
  { label: "Mid-range", icon: "✈️", desc: "Hotels & local dining" },
  { label: "Luxury", icon: "🌟", desc: "Resorts & fine dining" },
];

export default function ProfileSetup({ profile, setProfile, onSave, onSkip, saving }) {
  function toggleInterest(label) {
    setProfile((prev) => ({
      ...prev,
      interests: prev.interests.includes(label)
        ? prev.interests.filter((i) => i !== label)
        : [...prev.interests, label],
    }));
  }

  const progress = [
    profile.name.trim().length > 0,
    profile.homeCity.trim().length > 0,
    profile.budget.length > 0,
    profile.interests.length > 0,
  ].filter(Boolean).length;

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl text-white">Set up your profile</h2>
          <p className="mt-1 text-sm text-slate-400">Personalise your AI travel experience</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <span className="text-xs text-slate-400">{progress}/4 complete</span>
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className={`h-1.5 w-6 rounded-full transition-all ${i < progress ? "bg-cyan-300" : "bg-white/15"}`} />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Full name</span>
          <input
            type="text"
            value={profile.name}
            onChange={(e) => setProfile((p) => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          />
        </label>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Home city</span>
          <input
            type="text"
            value={profile.homeCity}
            onChange={(e) => setProfile((p) => ({ ...p, homeCity: e.target.value }))}
            placeholder="e.g. Mumbai"
            className="mt-2 h-11 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-sm text-slate-100 outline-none transition placeholder:text-slate-500 focus:border-cyan-300"
          />
        </label>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Travel budget</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {BUDGETS.map(({ label, icon, desc }) => (
            <button
              key={label}
              type="button"
              onClick={() => setProfile((p) => ({ ...p, budget: label }))}
              className={`flex flex-col items-center rounded-xl border p-3 text-center transition ${
                profile.budget === label
                  ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
                  : "border-white/15 bg-slate-900/60 text-slate-300 hover:border-white/30"
              }`}
            >
              <span className="text-xl">{icon}</span>
              <span className="mt-1 text-xs font-semibold">{label}</span>
              <span className="mt-0.5 text-[10px] text-slate-400 leading-tight">{desc}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4">
        <span className="text-xs font-semibold uppercase tracking-widest text-slate-400">Interests</span>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {INTERESTS.map(({ label, icon }) => (
            <button
              key={label}
              type="button"
              onClick={() => toggleInterest(label)}
              className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 text-xs font-semibold transition ${
                profile.interests.includes(label)
                  ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
                  : "border-white/15 bg-slate-900/60 text-slate-300 hover:border-white/30"
              }`}
            >
              <span className="text-base">{icon}</span>
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          type="button"
          onClick={onSkip}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 px-5 text-sm font-semibold text-slate-400 transition hover:bg-slate-900 hover:text-slate-200"
        >
          Skip for now
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!profile.name.trim() || saving}
          className="inline-flex h-11 flex-1 items-center justify-center rounded-xl bg-cyan-300 px-5 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save & Continue"}
        </button>
      </div>
    </div>
  );
}
