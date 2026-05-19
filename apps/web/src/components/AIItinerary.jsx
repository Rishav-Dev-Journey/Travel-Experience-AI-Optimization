import { useState } from "react";

export default function AIItinerary({ onClose, onGenerate }) {
  const [destination, setDestination] = useState("");
  const [days, setDays] = useState(3);
  const [interests, setInterests] = useState([]);
  const [budget, setBudget] = useState("Mid-range");
  const [numberOfPeople, setNumberOfPeople] = useState(1);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState(null);

  const INTERESTS = ["Beach", "Mountains", "Culture", "Adventure", "Food", "Wellness", "Wildlife", "Shopping"];
  const BUDGETS = ["Budget", "Mid-range", "Luxury"];

  function toggleInterest(interest) {
    setInterests(prev =>
      prev.includes(interest)
        ? prev.filter(i => i !== interest)
        : [...prev, interest]
    );
  }

  async function handleGenerate() {
    if (!destination.trim() || interests.length === 0) return;
    
    setGenerating(true);
    setError(null);
    try {
      await onGenerate({
        destination: destination.trim(),
        days,
        interests,
        budget,
        numberOfPeople
      });
    } catch (err) {
      setError(err.message || "Failed to generate itinerary. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl font-bold text-white">🤖 AI Itinerary Generator</h2>
            <p className="mt-1 text-sm text-slate-400">Get detailed day-by-day plans powered by AI</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-white/10 bg-slate-800/50 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Form */}
        <div className="space-y-5">
          {/* Destination */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Destination *
            </label>
            <input
              type="text"
              value={destination}
              onChange={(e) => setDestination(e.target.value)}
              placeholder="e.g., Goa, Manali, Paris, Bali"
              className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white placeholder-slate-500 focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
            />
          </div>

          {/* Days and People */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                Days
              </label>
              <input
                type="number"
                min="1"
                max="15"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
                People
              </label>
              <input
                type="number"
                min="1"
                max="20"
                value={numberOfPeople}
                onChange={(e) => setNumberOfPeople(parseInt(e.target.value) || 1)}
                className="w-full rounded-xl border border-white/10 bg-slate-800/50 px-4 py-3 text-white focus:border-cyan-300/50 focus:outline-none focus:ring-2 focus:ring-cyan-300/20"
              />
            </div>
          </div>

          {/* Budget */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Budget Style
            </label>
            <div className="grid grid-cols-3 gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => setBudget(b)}
                  className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                    budget === b
                      ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-200"
                      : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Interests */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">
              Interests *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTERESTS.map((interest) => (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`rounded-xl border px-3 py-2 text-sm font-semibold transition ${
                    interests.includes(interest)
                      ? "border-cyan-300/50 bg-cyan-300/20 text-cyan-200"
                      : "border-white/10 bg-slate-800/50 text-slate-400 hover:border-white/20 hover:text-white"
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="rounded-xl border border-red-400/30 bg-red-400/10 p-4 text-sm text-red-300">
              <p className="font-semibold mb-1">⚠️ Generation Failed</p>
              <p className="text-red-200/80 text-xs leading-relaxed">{error}</p>
            </div>
          )}

          {/* Generate Button */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={!destination.trim() || interests.length === 0 || generating}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 px-6 py-4 font-semibold text-slate-900 transition hover:from-cyan-300 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {generating ? (
              <span className="flex items-center justify-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-900 border-t-transparent" />
                Generating AI Itinerary...
              </span>
            ) : (
              "✨ Generate Itinerary"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
