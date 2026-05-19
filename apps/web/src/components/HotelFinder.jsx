import { useState, useMemo } from "react";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:5080";

export default function HotelFinder({ onClose }) {
  const [form, setForm] = useState({
    city: "",
    checkIn: "",
    checkOut: "",
    guests: "2",
    rooms: "1",
  });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [sortType, setSortType] = useState("recommended"); // recommended, cheapest, topRated

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isValid = form.city.trim() && form.checkIn && form.checkOut;

  async function handleSearch() {
    setSearching(true);
    setResults(null);
    try {
      let token = "";
      try {
        const val = localStorage.getItem("te_token");
        if (val) token = JSON.parse(val);
      } catch (e) {
        token = localStorage.getItem("te_token") || "";
      }
      const res = await fetch(`${API_BASE}/api/hotels/search`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          city: form.city,
          checkIn: form.checkIn,
          checkOut: form.checkOut,
          guests: parseInt(form.guests),
          rooms: parseInt(form.rooms)
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setResults(data || []);
      } else {
        console.error("Failed to fetch hotels");
        setResults([]);
      }
    } catch (err) {
      console.error(err);
      setResults([]);
    } finally {
      setSearching(false);
    }
  }

  const sortedResults = useMemo(() => {
    if (!results) return [];
    let sorted = [...results];
    if (sortType === "cheapest") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortType === "topRated") {
      sorted.sort((a, b) => b.rating - a.rating);
    } else {
      // Recommended: Balance of rating and price
      sorted.sort((a, b) => (b.rating * 1000 - b.price) - (a.rating * 1000 - a.price));
    }
    return sorted;
  }, [results, sortType]);

  const cheapestHotelId = useMemo(() => {
    if (!results || results.length === 0) return null;
    return [...results].sort((a, b) => a.price - b.price)[0].id;
  }, [results]);

  const topRatedHotelId = useMemo(() => {
    if (!results || results.length === 0) return null;
    return [...results].sort((a, b) => b.rating - a.rating)[0].id;
  }, [results]);

  const recommendedHotelId = useMemo(() => {
    if (!results || results.length === 0) return null;
    return [...results].sort((a, b) => (b.rating * 1000 - b.price) - (a.rating * 1000 - a.price))[0].id;
  }, [results]);

  const lowestPrice = results && results.length > 0 ? Math.min(...results.map(r => r.price)) : 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display text-xl text-white">Book a Stay 🏨</h2>
            <p className="mt-0.5 text-xs text-slate-400">Discover the perfect accommodation</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-slate-800/60 p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!results ? (
          <div className="mt-5 space-y-4 overflow-y-auto">
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Destination</label>
              <input type="text" value={form.city} onChange={(e) => set("city", e.target.value)} placeholder="City, Area, or Landmark" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Check In</label>
                <input type="date" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300 [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Check Out</label>
                <input type="date" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300 [color-scheme:dark]" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Guests</label>
                <input type="number" min="1" value={form.guests} onChange={(e) => set("guests", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Rooms</label>
                <input type="number" min="1" value={form.rooms} onChange={(e) => set("rooms", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
              </div>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={handleSearch} disabled={!isValid || searching} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-300 text-sm font-semibold text-slate-900 transition hover:bg-purple-200 disabled:opacity-50">
                {searching ? "Finding Stays..." : "Search Hotels"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col overflow-hidden">
            <div className="shrink-0 mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 flex items-center gap-3">
              <span className="text-2xl">🏨</span>
              <div>
                <p className="text-sm font-semibold text-emerald-300">Fantastic stays found!</p>
                <p className="text-xs text-emerald-200/70">The lowest price available is ₹{lowestPrice.toLocaleString()} per night. Book early for the best views in {form.city}.</p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-4 p-1 bg-slate-800/60 rounded-xl shrink-0">
              <button onClick={() => setSortType("recommended")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'recommended' ? 'bg-purple-300/20 text-purple-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Recommended</button>
              <button onClick={() => setSortType("cheapest")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'cheapest' ? 'bg-emerald-300/20 text-emerald-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Cheapest</button>
              <button onClick={() => setSortType("topRated")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'topRated' ? 'bg-orange-300/20 text-orange-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Top Rated</button>
            </div>

            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top {results.length} Recommendations</p>
              <button type="button" onClick={() => setResults(null)} className="text-[10px] text-purple-300 hover:underline">New Search →</button>
            </div>
            
            {results.length === 0 ? (
              <div className="text-center p-6 text-sm text-slate-400">
                <p>No hotels found. The AI mock engine might have returned an empty result or an error occurred.</p>
              </div>
            ) : (
              <div className="space-y-3 overflow-y-auto pr-1 flex-1 pb-4">
                {sortedResults.map((hotel) => {
                  const isCheapest = hotel.id === cheapestHotelId;
                  const isTopRated = hotel.id === topRatedHotelId;
                  const isRecommended = hotel.id === recommendedHotelId;

                  return (
                  <div key={hotel.id} className="relative rounded-2xl border border-white/10 bg-slate-800/40 p-4 hover:bg-slate-800/60 hover:border-purple-300/30 transition cursor-pointer flex items-center justify-between">
                    
                    <div className="flex gap-2 absolute -top-2.5 left-4">
                      {isRecommended && <span className="bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">⭐ Recommended</span>}
                      {isCheapest && <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">💰 Best Price</span>}
                      {isTopRated && <span className="bg-orange-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">🏆 Top Rated</span>}
                    </div>

                    <div className="flex-1 mt-1">
                      <p className="font-semibold text-white text-base">{hotel.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-yellow-400 font-bold">⭐ {hotel.rating}</span>
                        <span className="text-[10px] text-slate-400">({hotel.reviews} reviews)</span>
                        <span className="text-[10px] text-slate-500 ml-1">· {hotel.location}</span>
                      </div>
                      <div className="flex gap-1.5 mt-2">
                        {hotel.features.map(f => (
                          <span key={f} className="text-[9px] bg-white/10 text-slate-300 px-2 py-0.5 rounded-md">{f}</span>
                        ))}
                      </div>
                    </div>
                    
                    <div className="text-right flex flex-col items-end shrink-0 ml-4">
                      <p className="text-xl font-bold text-emerald-400">₹{hotel.price.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-500 mb-2">per night</p>
                      {hotel.bookingUrl ? (
                        <a href={hotel.bookingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center justify-center rounded-xl bg-purple-300 text-slate-900 px-4 py-1.5 text-xs font-bold transition hover:bg-purple-200 shadow-[0_0_15px_rgba(216,180,254,0.3)]">
                          Book Stay
                        </a>
                      ) : (
                        <button className="rounded-xl bg-purple-300 text-slate-900 px-4 py-1.5 text-xs font-bold transition hover:bg-purple-200 shadow-[0_0_15px_rgba(216,180,254,0.3)]">
                          Book Stay
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
