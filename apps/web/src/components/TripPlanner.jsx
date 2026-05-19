import { useState } from "react";

const TRANSPORT_MODES = [
  { value: "air", label: "Air", icon: "✈️" },
  { value: "train", label: "Train", icon: "🚆" },
  { value: "road", label: "Road", icon: "🛣️" },
  { value: "bus", label: "Bus", icon: "🚌" },
  { value: "water", label: "Water", icon: "🚢" },
];

const INTERESTS = [
  { value: "Beach", icon: "🏖️" },
  { value: "Mountains", icon: "🏔️" },
  { value: "Culture", icon: "🏛️" },
  { value: "Adventure", icon: "🧗" },
  { value: "Food", icon: "🍜" },
  { value: "Wellness", icon: "🧘" },
  { value: "Nightlife", icon: "🌃" },
  { value: "Wildlife", icon: "🦁" },
];

const today = new Date().toISOString().split("T")[0];

export default function TripPlanner({ profile, onSearch, onClose }) {
  const [form, setForm] = useState({
    sourceCity: profile.homeCity || "",
    budgetMin: "",
    budgetMax: "",
    startDate: "",
    days: "",
    interests: profile.interests || [],
    transport: [],
  });

  function toggle(field, value) {
    setForm((prev) => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter((v) => v !== value)
        : [...prev[field], value],
    }));
  }

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isValid =
    form.sourceCity.trim() &&
    form.budgetMin &&
    form.budgetMax &&
    form.startDate &&
    form.days &&
    form.interests.length > 0 &&
    form.transport.length > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />

      <div className="relative z-50 w-full max-w-xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-display text-xl text-white">Plan Your Trip 🗺️</h2>
            <p className="mt-0.5 text-xs text-slate-400">Fill in your preferences to get AI recommendations</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-slate-800/60 p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="mt-5 space-y-4 max-h-[65vh] overflow-y-auto pr-1">
          {/* Source city */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Source City</label>
            <input
              type="text"
              value={form.sourceCity}
              onChange={(e) => set("sourceCity", e.target.value)}
              placeholder="e.g. Kolkata"
              className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300"
            />
          </div>

          {/* Budget range */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Budget Range (₹)</label>
            <div className="mt-2 flex items-center gap-2">
              <input
                type="number"
                value={form.budgetMin}
                onChange={(e) => set("budgetMin", e.target.value)}
                placeholder="Min"
                className="h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300"
              />
              <span className="text-slate-500">—</span>
              <input
                type="number"
                value={form.budgetMax}
                onChange={(e) => set("budgetMax", e.target.value)}
                placeholder="Max"
                className="h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300"
              />
            </div>
          </div>

          {/* Dates + duration */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Start Date</label>
              <input
                type="date"
                value={form.startDate}
                min={today}
                onChange={(e) => set("startDate", e.target.value)}
                className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300 [color-scheme:dark]"
              />
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Duration (days)</label>
              <input
                type="number"
                value={form.days}
                min="1"
                max="30"
                onChange={(e) => set("days", e.target.value)}
                placeholder="e.g. 5"
                className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none placeholder:text-slate-500 focus:border-cyan-300"
              />
            </div>
          </div>

          {/* Transport modes */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Preferred Transport</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {TRANSPORT_MODES.map(({ value, label, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle("transport", value)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    form.transport.includes(value)
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
                      : "border-white/15 bg-slate-800/60 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <span>{icon}</span> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Interests</label>
            <div className="mt-2 flex flex-wrap gap-2">
              {INTERESTS.map(({ value, icon }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => toggle("interests", value)}
                  className={`flex items-center gap-1.5 rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                    form.interests.includes(value)
                      ? "border-cyan-300 bg-cyan-300/10 text-cyan-200"
                      : "border-white/15 bg-slate-800/60 text-slate-300 hover:border-white/30"
                  }`}
                >
                  <span>{icon}</span> {value}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 flex-1 items-center justify-center rounded-xl border border-white/15 bg-slate-800/60 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onSearch(form)}
            disabled={!isValid}
            className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            🤖 Get AI Recommendations
          </button>
        </div>
      </div>
    </div>
  );
}
