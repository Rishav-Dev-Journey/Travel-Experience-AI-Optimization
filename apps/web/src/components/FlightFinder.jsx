import { useState, useMemo } from "react";

const MOCK_FLIGHTS = [
  { id: 1, airline: "Indigo", flightNo: "6E-101", dep: "08:00 AM", arr: "10:30 AM", duration: "2h 30m", durationMins: 150, price: 5400, type: "Non-stop" },
  { id: 2, airline: "Vistara", flightNo: "UK-902", dep: "11:15 AM", arr: "01:50 PM", duration: "2h 35m", durationMins: 155, price: 6800, type: "Non-stop" },
  { id: 3, airline: "Air India", flightNo: "AI-404", dep: "04:45 PM", arr: "07:20 PM", duration: "2h 35m", durationMins: 155, price: 6100, type: "Non-stop" },
  { id: 4, airline: "SpiceJet", flightNo: "SG-211", dep: "08:30 PM", arr: "11:00 PM", duration: "2h 30m", durationMins: 150, price: 4900, type: "Non-stop" },
  { id: 5, airline: "Akasa Air", flightNo: "QP-132", dep: "06:10 AM", arr: "08:20 AM", duration: "2h 10m", durationMins: 130, price: 5200, type: "Non-stop" },
  { id: 6, airline: "Air India Express", flightNo: "IX-505", dep: "01:00 PM", arr: "05:00 PM", duration: "4h 00m", durationMins: 240, price: 4100, type: "1 Stop" },
  { id: 7, airline: "Indigo", flightNo: "6E-882", dep: "09:45 PM", arr: "11:55 PM", duration: "2h 10m", durationMins: 130, price: 4800, type: "Non-stop" },
  { id: 8, airline: "Vistara", flightNo: "UK-820", dep: "07:00 AM", arr: "09:30 AM", duration: "2h 30m", durationMins: 150, price: 7200, type: "Non-stop" },
];

export default function FlightFinder({ onClose }) {
  const [form, setForm] = useState({
    from: "",
    to: "",
    date: "",
    passengers: "1",
    class: "Economy",
  });
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState(null);
  const [sortType, setSortType] = useState("best"); // 'best', 'cheapest', 'fastest'

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  const isValid = form.from.trim() && form.to.trim() && form.date;

  function handleSearch() {
    setSearching(true);
    setResults(null);
    setTimeout(() => {
      setSearching(false);
      setResults(MOCK_FLIGHTS);
    }, 1500);
  }

  const sortedResults = useMemo(() => {
    if (!results) return [];
    let sorted = [...results];
    if (sortType === "cheapest") {
      sorted.sort((a, b) => a.price - b.price);
    } else if (sortType === "fastest") {
      sorted.sort((a, b) => a.durationMins - b.durationMins);
    } else {
      // Best: price and duration balanced
      sorted.sort((a, b) => (a.price * 0.6 + a.durationMins * 10) - (b.price * 0.6 + b.durationMins * 10));
    }
    return sorted;
  }, [results, sortType]);

  const cheapestFlightId = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => a.price - b.price)[0].id;
  }, [results]);

  const fastestFlightId = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => a.durationMins - b.durationMins)[0].id;
  }, [results]);

  const bestFlightId = useMemo(() => {
    if (!results) return null;
    return [...results].sort((a, b) => (a.price * 0.6 + a.durationMins * 10) - (b.price * 0.6 + b.durationMins * 10))[0].id;
  }, [results]);

  const lowestPrice = results ? Math.min(...results.map(r => r.price)) : 0;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-50 w-full max-w-2xl rounded-3xl border border-white/15 bg-slate-900/95 p-6 shadow-2xl backdrop-blur-xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between shrink-0">
          <div>
            <h2 className="font-display text-xl text-white">Find Flights ✈️</h2>
            <p className="mt-0.5 text-xs text-slate-400">Search for the best flight options</p>
          </div>
          <button type="button" onClick={onClose} className="rounded-xl border border-white/10 bg-slate-800/60 p-2 text-slate-400 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!results ? (
          <div className="mt-5 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">From</label>
                <input type="text" value={form.from} onChange={(e) => set("from", e.target.value)} placeholder="Origin City" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">To</label>
                <input type="text" value={form.to} onChange={(e) => set("to", e.target.value)} placeholder="Destination City" className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Date</label>
                <input type="date" value={form.date} onChange={(e) => set("date", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300 [color-scheme:dark]" />
              </div>
              <div>
                <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Passengers</label>
                <input type="number" min="1" value={form.passengers} onChange={(e) => set("passengers", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300" />
              </div>
            </div>
            <div>
              <label className="text-xs font-semibold uppercase tracking-widest text-slate-400">Class</label>
              <select value={form.class} onChange={(e) => set("class", e.target.value)} className="mt-2 h-10 w-full rounded-xl border border-white/15 bg-slate-800/60 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300">
                <option value="Economy">Economy</option>
                <option value="Premium Economy">Premium Economy</option>
                <option value="Business">Business</option>
              </select>
            </div>
            <div className="mt-5 flex gap-3">
              <button type="button" onClick={handleSearch} disabled={!isValid || searching} className="inline-flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-cyan-300 text-sm font-semibold text-slate-900 transition hover:bg-cyan-200 disabled:opacity-50">
                {searching ? "Analyzing Flight Data..." : "Search Flights"}
              </button>
            </div>
          </div>
        ) : (
          <div className="mt-5 flex flex-col overflow-hidden">
            <div className="shrink-0 mb-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-3 flex items-center gap-3">
              <span className="text-2xl">💡</span>
              <div>
                <p className="text-sm font-semibold text-emerald-300">Great prices available!</p>
                <p className="text-xs text-emerald-200/70">The lowest price we found is ₹{lowestPrice.toLocaleString()}. These are lower than typical for {form.from} to {form.to}.</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-4 p-1 bg-slate-800/60 rounded-xl shrink-0">
              <button onClick={() => setSortType("best")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'best' ? 'bg-cyan-300/20 text-cyan-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Best</button>
              <button onClick={() => setSortType("cheapest")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'cheapest' ? 'bg-emerald-300/20 text-emerald-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Cheapest</button>
              <button onClick={() => setSortType("fastest")} className={`flex-1 py-2 text-xs font-semibold rounded-lg transition ${sortType === 'fastest' ? 'bg-blue-300/20 text-blue-300 shadow' : 'text-slate-400 hover:text-slate-200'}`}>Fastest</button>
            </div>

            <div className="flex items-center justify-between mb-2 shrink-0">
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-400">Top {results.length} Recommendations</p>
              <button type="button" onClick={() => setResults(null)} className="text-[10px] text-cyan-300 hover:underline">New Search →</button>
            </div>
            
            <div className="space-y-3 overflow-y-auto pr-1 flex-1 pb-4">
              {sortedResults.map((flight) => {
                const isCheapest = flight.id === cheapestFlightId;
                const isFastest = flight.id === fastestFlightId;
                const isBest = flight.id === bestFlightId;

                return (
                  <div key={flight.id} className="relative rounded-2xl border border-white/10 bg-slate-800/40 p-4 hover:bg-slate-800/60 hover:border-cyan-300/30 transition cursor-pointer">
                    
                    <div className="flex gap-2 absolute -top-2.5 left-4">
                      {isBest && <span className="bg-purple-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">⭐ Best</span>}
                      {isCheapest && <span className="bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">💰 Cheapest</span>}
                      {isFastest && <span className="bg-blue-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg">⚡ Fastest</span>}
                    </div>

                    <div className="flex items-center justify-between mt-1">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                          <span className="text-lg">✈️</span>
                        </div>
                        <div>
                          <p className="font-semibold text-white">{flight.airline} <span className="text-xs text-slate-400 font-normal ml-1">{flight.flightNo}</span></p>
                          <div className="flex items-center gap-3 mt-1">
                            <div className="text-center">
                              <p className="text-sm text-slate-200 font-medium">{flight.dep}</p>
                              <p className="text-[10px] text-slate-500">{form.from || "Origin"}</p>
                            </div>
                            <div className="flex flex-col items-center w-16">
                              <p className="text-[9px] text-slate-400">{flight.duration}</p>
                              <div className="w-full border-t border-dashed border-slate-600 my-1 relative">
                                <span className="absolute -top-2 left-1/2 -translate-x-1/2 text-[10px]">✈</span>
                              </div>
                              <p className="text-[9px] text-slate-500">{flight.type}</p>
                            </div>
                            <div className="text-center">
                              <p className="text-sm text-slate-200 font-medium">{flight.arr}</p>
                              <p className="text-[10px] text-slate-500">{form.to || "Dest"}</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-right flex flex-col items-end">
                        <p className="text-xl font-bold text-emerald-400">₹{flight.price.toLocaleString()}</p>
                        <p className="text-[9px] text-slate-500 mb-2">per adult</p>
                        <button className="rounded-xl bg-cyan-300 text-slate-900 px-4 py-1.5 text-xs font-bold transition hover:bg-cyan-200 shadow-[0_0_15px_rgba(103,232,249,0.3)]">
                          Select
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
