export default function ItineraryDisplay({ itinerary, onClose }) {
  if (!itinerary) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4 backdrop-blur-sm">
      <div className="mx-auto max-w-4xl">
        <div className="relative rounded-3xl border border-white/20 bg-slate-900/95 p-6 shadow-2xl my-8">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="font-display text-3xl font-bold text-white">{itinerary.destination}</h2>
              <p className="mt-2 text-sm text-slate-400">{itinerary.totalDays} Days Itinerary</p>
              <p className="mt-2 text-sm text-slate-300">{itinerary.overview}</p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-white/10 bg-slate-800/50 p-2 text-slate-400 transition hover:bg-slate-800 hover:text-white"
            >
              ✕
            </button>
          </div>

          {/* Day Plans */}
          <div className="space-y-6 mb-8">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300">Day-by-Day Plan</h3>
            {itinerary.dayPlans.map((day) => (
              <div key={day.day} className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-display text-lg font-bold text-white">
                    Day {day.day}: {day.title}
                  </h4>
                  <span className="rounded-full bg-emerald-400/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                    ₹{day.estimatedCost?.toLocaleString()}
                  </span>
                </div>

                {/* Time-based activities */}
                <div className="space-y-3 mb-4">
                  <div className="flex gap-3">
                    <span className="text-2xl">🌅</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Morning</p>
                      <p className="mt-1 text-sm text-slate-300">{day.morning}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">☀️</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Afternoon</p>
                      <p className="mt-1 text-sm text-slate-300">{day.afternoon}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <span className="text-2xl">🌆</span>
                    <div className="flex-1">
                      <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Evening</p>
                      <p className="mt-1 text-sm text-slate-300">{day.evening}</p>
                    </div>
                  </div>
                </div>

                {/* Must Visit */}
                {day.mustVisit && day.mustVisit.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">📍 Must Visit</p>
                    <div className="flex flex-wrap gap-2">
                      {day.mustVisit.map((place, i) => (
                        <span key={i} className="rounded-lg bg-cyan-300/10 px-3 py-1 text-xs text-cyan-200">
                          {place}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Food Recommendations */}
                {day.foodRecommendations && day.foodRecommendations.length > 0 && (
                  <div className="mb-3">
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">🍽️ Food</p>
                    <div className="flex flex-wrap gap-2">
                      {day.foodRecommendations.map((food, i) => (
                        <span key={i} className="rounded-lg bg-orange-300/10 px-3 py-1 text-xs text-orange-200">
                          {food}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Local Tips */}
                {day.localTips && day.localTips.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-widest text-slate-400 mb-2">💡 Tips</p>
                    <ul className="space-y-1">
                      {day.localTips.map((tip, i) => (
                        <li key={i} className="text-xs text-slate-400">• {tip}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Additional Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Packing List */}
            {itinerary.packingList && itinerary.packingList.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-3">🎒 Packing List</h3>
                <ul className="space-y-1">
                  {itinerary.packingList.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Budget Breakdown */}
            {itinerary.budgetBreakdown && itinerary.budgetBreakdown.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-3">💰 Budget</h3>
                <ul className="space-y-1">
                  {itinerary.budgetBreakdown.map((item, i) => (
                    <li key={i} className="text-sm text-slate-300">• {item}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Travel Tips */}
            {itinerary.travelTips && itinerary.travelTips.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-3">✈️ Travel Tips</h3>
                <ul className="space-y-1">
                  {itinerary.travelTips.map((tip, i) => (
                    <li key={i} className="text-sm text-slate-300">• {tip}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Sources */}
            {itinerary.sources && itinerary.sources.length > 0 && (
              <div className="rounded-2xl border border-white/10 bg-slate-800/50 p-5">
                <h3 className="text-xs font-semibold uppercase tracking-widest text-cyan-300 mb-3">📚 Sources</h3>
                <ul className="space-y-1">
                  {itinerary.sources.map((source, i) => (
                    <li key={i} className="text-xs text-slate-400 italic">• {source}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-6 flex justify-center">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-cyan-300/20 px-6 py-3 font-semibold text-cyan-200 transition hover:bg-cyan-300/30"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
