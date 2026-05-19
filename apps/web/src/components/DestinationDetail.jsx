export default function DestinationDetail({ destination, numberOfPeople, onClose }) {
  if (!destination) return null;

  const totalPrice = destination.pricePerPerson * (numberOfPeople || 1);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl border border-white/15 bg-slate-900/95 shadow-2xl backdrop-blur-xl">
        {/* Header Image */}
        <div className="relative h-64 overflow-hidden">
          <img src={destination.imageUrl} alt={destination.name} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/50 to-transparent" />
          
          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 rounded-xl border border-white/20 bg-slate-900/80 p-2 text-white backdrop-blur-sm hover:bg-slate-800"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-full bg-cyan-300 px-3 py-1 text-xs font-bold text-slate-900">
                Score: {destination.score}/100
              </span>
              {destination.pricePerPerson && (
                <span className="rounded-full bg-emerald-400 px-3 py-1 text-xs font-bold text-slate-900">
                  ₹{destination.pricePerPerson.toLocaleString()}/person
                </span>
              )}
            </div>
            <h2 className="font-display text-3xl font-bold text-white">{destination.name}</h2>
            <p className="mt-1 text-sm text-slate-300">{destination.country}</p>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Description */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">About</h3>
            <p className="mt-2 text-sm leading-relaxed text-slate-200">{destination.description}</p>
          </div>

          {/* Price Breakdown */}
          {destination.pricePerPerson && numberOfPeople && (
            <div className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-emerald-300">Price Breakdown</h3>
              <div className="mt-3 space-y-3">
                {/* Per Person Breakdown */}
                <div className="rounded-lg bg-slate-800/60 p-3 space-y-2">
                  <p className="text-xs font-semibold text-slate-300">Per Person Cost:</p>
                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Accommodation (3-4 nights)</span>
                      <span className="text-white">₹{Math.round(destination.pricePerPerson * 0.35).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Meals & Food</span>
                      <span className="text-white">₹{Math.round(destination.pricePerPerson * 0.25).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Local Transport</span>
                      <span className="text-white">₹{Math.round(destination.pricePerPerson * 0.15).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Activities & Sightseeing</span>
                      <span className="text-white">₹{Math.round(destination.pricePerPerson * 0.20).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Miscellaneous</span>
                      <span className="text-white">₹{Math.round(destination.pricePerPerson * 0.05).toLocaleString()}</span>
                    </div>
                    <div className="h-px bg-emerald-400/30 my-2" />
                    <div className="flex justify-between font-semibold">
                      <span className="text-emerald-200">Total per person:</span>
                      <span className="text-emerald-200">₹{destination.pricePerPerson.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Group Total */}
                <div className="rounded-lg bg-emerald-500/20 p-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-emerald-300">Total for {numberOfPeople} {numberOfPeople === 1 ? 'person' : 'people'}</p>
                      <p className="text-2xl font-bold text-emerald-200 mt-1">₹{totalPrice.toLocaleString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-emerald-300">Savings</p>
                      <p className="text-lg font-semibold text-emerald-200">₹{Math.round(totalPrice * 0.1).toLocaleString()}</p>
                      <p className="text-[10px] text-emerald-400">Group discount</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-3 space-y-1">
                <p className="text-xs text-slate-400">✓ Includes: Accommodation, meals, local transport, activities</p>
                <p className="text-xs text-slate-400">✗ Excludes: Flights/trains to destination, travel insurance, shopping</p>
              </div>
            </div>
          )}

          {/* Interests */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Interests</h3>
            <div className="mt-2 flex flex-wrap gap-2">
              {destination.interests.map((interest) => (
                <span key={interest} className="rounded-lg border border-cyan-300/30 bg-cyan-300/10 px-3 py-1.5 text-sm text-cyan-200">
                  {interest}
                </span>
              ))}
            </div>
          </div>

          {/* Highlights */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top Highlights</h3>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
              {destination.highlights.map((highlight) => (
                <div key={highlight} className="flex items-start gap-2 rounded-lg bg-slate-800/60 p-3">
                  <span className="text-cyan-300">✓</span>
                  <span className="text-sm text-slate-200">{highlight}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Ideal Duration</p>
              <p className="mt-2 font-display text-lg font-semibold text-white">
                {destination.idealDaysMin}–{destination.idealDaysMax} days
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Budget Range</p>
              <p className="mt-2 font-display text-lg font-semibold text-white">
                ₹{(destination.budgetMin / 1000).toFixed(0)}K–{(destination.budgetMax / 1000).toFixed(0)}K
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 p-4">
              <p className="text-xs uppercase tracking-widest text-slate-500">Transport</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {destination.availableTransport.map((mode) => (
                  <span key={mode} className="text-sm text-white capitalize">{mode}</span>
                )).reduce((prev, curr) => [prev, ', ', curr])}
              </div>
            </div>
          </div>

          {/* AI Reasoning */}
          {destination.scoreBreakdown && (
            <div className="rounded-2xl border border-purple-400/30 bg-purple-400/10 p-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-purple-300">Why This Destination?</h3>
              <div className="mt-3 space-y-2">
                {destination.scoreBreakdown.split('|').map((reason, index) => {
                  // Parse the reason to make it more readable
                  let icon = '✓';
                  let text = reason;
                  
                  if (reason.includes('budget')) {
                    icon = '💰';
                    text = 'Perfect budget match for your range';
                  } else if (reason.includes('interests')) {
                    icon = '❤️';
                    const interests = reason.match(/\(([^)]+)\)/)?.[1] || '';
                    text = `Matches your interests: ${interests}`;
                  } else if (reason.includes('season')) {
                    icon = '☀️';
                    text = 'Ideal season to visit';
                  } else if (reason.includes('duration')) {
                    icon = '🗓️';
                    text = 'Perfect duration for this destination';
                  } else if (reason.includes('transport')) {
                    icon = '🚀';
                    const modes = reason.match(/\(([^)]+)\)/)?.[1] || '';
                    text = `Accessible via: ${modes}`;
                  }
                  
                  return (
                    <div key={index} className="flex items-start gap-3 rounded-lg bg-slate-800/60 p-3">
                      <span className="text-lg">{icon}</span>
                      <span className="text-sm text-purple-200">{text}</span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex items-center gap-2 rounded-lg bg-purple-500/20 p-3">
                <span className="text-2xl">🤖</span>
                <p className="text-xs text-purple-200">
                  AI analyzed {destination.scoreBreakdown.split('|').length} factors to recommend this destination with a score of <span className="font-bold">{destination.score}/100</span>
                </p>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-white/15 bg-slate-800/60 py-3 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Close
            </button>
            <button
              type="button"
              className="flex-1 rounded-xl bg-cyan-300 py-3 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200"
            >
              Book Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
