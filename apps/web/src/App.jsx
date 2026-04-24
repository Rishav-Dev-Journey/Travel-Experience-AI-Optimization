import { useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

const TRAVEL_BACKGROUND_IMAGES = [
  "https://source.unsplash.com/1200x900/?kerala,temple&sig=1",
  "https://source.unsplash.com/1200x900/?india,temple&sig=2",
  "https://source.unsplash.com/1200x900/?kerala,church&sig=3",
  "https://source.unsplash.com/1200x900/?india,church&sig=4",
  "https://source.unsplash.com/1200x900/?kerala,backwaters&sig=5",
  "https://source.unsplash.com/1200x900/?kerala,houseboat&sig=6",
  "https://source.unsplash.com/1200x900/?munnar,tea,plantation&sig=7",
  "https://source.unsplash.com/1200x900/?kerala,hills&sig=8",
  "https://source.unsplash.com/1200x900/?kochi,fort&sig=9",
  "https://source.unsplash.com/1200x900/?varkala,beach&sig=10",
  "https://source.unsplash.com/1200x900/?alleppey,boat&sig=11",
  "https://source.unsplash.com/1200x900/?kerala,waterfall&sig=12",
  "https://source.unsplash.com/1200x900/?south,india,temple&sig=13",
  "https://source.unsplash.com/1200x900/?cathedral,india&sig=14",
  "https://source.unsplash.com/1200x900/?trivandrum,temple&sig=15",
  "https://source.unsplash.com/1200x900/?kerala,sunset&sig=16",
  "https://source.unsplash.com/1200x900/?india,heritage,temple&sig=17",
  "https://source.unsplash.com/1200x900/?kerala,river&sig=18",
  "https://source.unsplash.com/1200x900/?kerala,rainforest&sig=19",
  "https://source.unsplash.com/1200x900/?kerala,travel&sig=20",
  "https://source.unsplash.com/1200x900/?india,landscape&sig=21",
  "https://source.unsplash.com/1200x900/?india,architecture,church&sig=22",
  "https://source.unsplash.com/1200x900/?old,church,kerala&sig=23",
  "https://source.unsplash.com/1200x900/?hindu,temple,south,india&sig=24",
  "https://source.unsplash.com/1200x900/?kerala,forest&sig=25",
  "https://source.unsplash.com/1200x900/?kerala,coastline&sig=26",
  "https://source.unsplash.com/1200x900/?kerala,village&sig=27",
  "https://source.unsplash.com/1200x900/?india,train,bridge&sig=28",
  "https://source.unsplash.com/1200x900/?kerala,bridge&sig=29",
  "https://source.unsplash.com/1200x900/?kochi,harbor&sig=30",
  "https://source.unsplash.com/1200x900/?kerala,mountain&sig=31",
  "https://source.unsplash.com/1200x900/?india,monsoon,landscape&sig=32",
];

function normalizeIdentifier(value) {
  return value.trim();
}

function App() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [token, setToken] = useState("");
  const [destination, setDestination] = useState("");
  const [step, setStep] = useState("email");
  const [message, setMessage] = useState(
    "Request an OTP to start the login flow.",
  );
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [copied, setCopied] = useState(false);

  function copyDemoOtp() {
    navigator.clipboard.writeText(demoOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const canVerify = useMemo(
    () => challengeId.length > 0 && otp.trim().length > 0,
    [challengeId, otp],
  );

  async function requestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("Generating OTP...");
    setToken("");
    setDemoOtp("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          identifier: normalizeIdentifier(identifier),
          channel: "email",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to request OTP.");
      }

      setChallengeId(data.challengeId);
      setDestination(data.destination || "your inbox");
      setDemoOtp(data.demoOtp || "");
      setOtp("");
      setStep("otp");
      setMessage(
        `OTP sent to ${data.destination}.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function verifyOtp(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("Verifying OTP...");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/verify-otp`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeId,
          otp: otp.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Unable to verify OTP.");
      }

      setToken(data.token);
      setStep("success");
      setMessage(
        `Logged in as ${data.user.identifier} via ${data.user.channel}.`,
      );
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="relative min-h-screen overflow-x-hidden px-4 py-6 md:px-8 md:py-10 lg:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="scenic-bg" aria-hidden="true">
          <div className="scenic-photo" />
          <div className="scenic-mosaic">
            {TRAVEL_BACKGROUND_IMAGES.map((imageUrl, index) => (
              <div
                key={`${imageUrl}-${index}`}
                className="scenic-mosaic-item"
                style={{
                  backgroundImage: `linear-gradient(180deg, rgba(2, 6, 23, 0.18), rgba(2, 6, 23, 0.45)), url(${imageUrl})`,
                  "--tile-size": `${110 + (index % 6) * 20}px`,
                  "--tile-left": `${(index * 13) % 100}%`,
                  "--tile-top": `${8 + ((index * 17) % 78)}%`,
                  "--tile-delay": `${index * 0.2}s`,
                  "--tile-duration": `${14 + (index % 7) * 2}s`,
                }}
              />
            ))}
          </div>
          <div className="scenic-train-photo" />
          <div className="scenic-plane-photo" />
        </div>
        <div className="absolute left-[-9rem] top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulseSoft" />
        <div className="absolute bottom-6 right-[-8rem] h-80 w-80 rounded-full bg-orange-300/20 blur-3xl animate-pulseSoft" />
      </div>

      <div className="relative z-10 mx-auto grid max-w-[1280px] items-stretch gap-4 pb-10 sm:gap-5 lg:grid-cols-2">
        <section className="animate-floatIn rounded-3xl border border-white/15 bg-white/10 p-4 shadow-glass backdrop-blur-xl sm:p-5 md:p-5 lg:p-5 flex flex-col">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-cyan-200">
            Welcome to Travel Experience AI
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-2xl leading-tight text-white sm:text-3xl md:text-4xl lg:text-[2.5rem]">
            Plan smarter trips with AI, inspired by modern travel platforms.
          </h1>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-slate-200/90">
            Discover destinations, build itineraries, and unlock seamless booking
            experiences after a secure OTP sign in.
          </p>

          <div className="mt-5 grid gap-2 sm:grid-cols-1 lg:grid-cols-2">
            <article className="rounded-2xl border border-white/15 bg-slate-900/45 p-3 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-200">Destination</p>
              <p className="mt-2 font-display text-base text-white">Goa</p>
              <p className="mt-1 text-xs text-slate-300">Beach AI itinerary</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-slate-900/45 p-3 backdrop-blur-md">
              <p className="text-xs uppercase tracking-[0.2em] text-orange-200">Flight</p>
              <p className="mt-2 font-display text-base text-white">DEL to BOM</p>
              <p className="mt-1 text-xs text-slate-300">Best fare insights</p>
            </article>
            <article className="rounded-2xl border border-white/15 bg-slate-900/45 p-3 backdrop-blur-md sm:col-span-1 lg:col-span-2">
              <p className="text-xs uppercase tracking-[0.2em] text-emerald-200">Stay</p>
              <p className="mt-2 font-display text-base text-white">City Boutique</p>
              <p className="mt-1 text-xs text-slate-300">Smart budget match</p>
            </article>
          </div>

          <div className="mt-5 hidden rounded-2xl border border-white/15 bg-slate-950/45 p-4 xl:block">
            <svg viewBox="0 0 460 120" className="h-20 w-full" aria-hidden="true">
              <path d="M20 90 C120 20, 220 20, 320 90 S430 95, 440 46" fill="none" stroke="rgba(125,211,252,0.9)" strokeWidth="3" strokeDasharray="7 7" />
              <circle cx="20" cy="90" r="5" fill="rgba(34,211,238,1)" />
              <circle cx="440" cy="46" r="5" fill="rgba(56,189,248,1)" />
              <path d="M212 58 l13 6 -13 6 4 -6z" fill="rgba(255,255,255,0.95)" />
            </svg>
            <p className="mt-2 text-xs text-slate-300">AI route intelligence from discovery to checkout</p>
          </div>

          <div className="mt-5 hidden overflow-hidden rounded-2xl border border-white/15 bg-slate-950/40 p-3 xl:block">
            <div className="travel-gallery-track">
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=900&q=80" alt="Mountain valley" />
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=900&q=80" alt="Lake reflections" />
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1474302770737-173ee21bab63?auto=format&fit=crop&w=900&q=80" alt="Train crossing" />
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=900&q=80" alt="Airplane wing view" />
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1488085061387-422e29b40080?auto=format&fit=crop&w=900&q=80" alt="Snow mountains" />
              <img className="travel-gallery-image" src="https://images.unsplash.com/photo-1501555088652-021faa106b9b?auto=format&fit=crop&w=900&q=80" alt="Scenic destination" />
            </div>
          </div>
        </section>

        <section className="animate-floatIn flex flex-col justify-center rounded-3xl border border-white/15 bg-slate-950/45 p-7 shadow-glass backdrop-blur-xl [animation-delay:120ms] sm:p-8 md:p-10 lg:p-12 xl:p-16">
          <div className="mb-6 flex items-center gap-2">
            <div className={`h-2.5 w-10 rounded-full ${step === "email" ? "bg-cyan-300" : "bg-cyan-300/30"}`} />
            <div className={`h-2.5 w-10 rounded-full ${step === "otp" ? "bg-cyan-300" : "bg-cyan-300/30"}`} />
            <div className={`h-2.5 w-10 rounded-full ${step === "success" ? "bg-cyan-300" : "bg-cyan-300/30"}`} />
          </div>

          <div key={step} className="animate-floatIn">
            {step === "email" ? (
              <form onSubmit={requestOtp}>
                <h2 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">Sign in with Email</h2>
                <p className="mt-3 text-base text-slate-300">Enter your email to receive a one-time password.</p>

                <label className="mt-5 block">
                  <span className="text-base font-semibold text-slate-200">Email address</span>
                  <input
                    type="email"
                    value={identifier}
                    onChange={(event) => setIdentifier(event.target.value)}
                    placeholder="you@example.com"
                    className="mt-2 h-14 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                  />
                </label>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-6 inline-flex h-14 w-full items-center justify-center rounded-xl bg-cyan-300 px-5 text-base font-semibold text-slate-900 transition hover:translate-y-[-1px] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {loading ? "Sending..." : "Continue"}
                </button>
              </form>
            ) : null}

            {step === "otp" ? (
              <form onSubmit={verifyOtp}>
                <h2 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">Verify OTP</h2>
                <p className="mt-3 text-base text-slate-300">Enter the OTP sent to {destination || "your email"}.</p>

                <label className="mt-5 block">
                  <span className="text-base font-semibold text-slate-200">One-time password</span>
                  <input
                    inputMode="numeric"
                    value={otp}
                    onChange={(event) => setOtp(event.target.value)}
                    placeholder="Enter the 6-digit OTP"
                    className="mt-2 h-14 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
                  />
                </label>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={() => setStep("email")}
                    className="inline-flex h-14 flex-1 items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 px-5 text-base font-semibold text-slate-100 transition hover:bg-slate-900"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading || !canVerify}
                    className="inline-flex h-14 flex-1 items-center justify-center rounded-xl bg-cyan-300 px-5 text-base font-semibold text-slate-900 transition hover:translate-y-[-1px] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </div>

                {demoOtp ? (
                  <div className="mt-4 flex items-center gap-2">
                    <p className="font-display text-lg tracking-widest text-cyan-200">
                      Demo OTP: {demoOtp}
                    </p>
                    <button
                      type="button"
                      onClick={copyDemoOtp}
                      title="Copy OTP"
                      className="flex items-center gap-1 rounded-lg border border-white/15 bg-slate-800/60 px-2 py-1 text-xs text-slate-300 transition hover:bg-slate-700 hover:text-cyan-200"
                    >
                      {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                        </svg>
                      )}
                      {copied ? "Copied" : "Copy"}
                    </button>
                  </div>
                ) : null}
                <p className="mt-3 break-all text-xs text-slate-300">Challenge ID: {challengeId}</p>
              </form>
            ) : null}

            {step === "success" ? (
              <div>
                <h2 className="font-display text-2xl text-white">Welcome Aboard</h2>
                <p className="mt-2 text-sm text-slate-300">You are signed in. Your AI travel workspace is ready.</p>

                <div className="mt-5 rounded-xl border border-emerald-300/25 bg-emerald-300/10 p-4 text-sm text-emerald-100">
                  {message}
                </div>

                <p className="mt-4 break-all rounded-xl border border-white/10 bg-white/5 p-3 font-mono text-xs text-slate-200">
                  Token: {token}
                </p>

                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setOtp("");
                    setChallengeId("");
                    setToken("");
                    setDemoOtp("");
                    setMessage("Request an OTP to start the login flow.");
                  }}
                  className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl border border-white/20 bg-slate-900/80 px-5 font-semibold text-slate-100 transition hover:bg-slate-900"
                >
                  Sign in with another email
                </button>
              </div>
            ) : null}
          </div>

          {step !== "success" ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="leading-6">{message}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}

export default App;
