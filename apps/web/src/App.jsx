import { useEffect, useMemo, useRef, useState } from "react";
import AuthEmail from "./components/AuthEmail";
import AuthOtp from "./components/AuthOtp";
import ProfileSetup from "./components/ProfileSetup";
import Home from "./components/Home";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";
const IDLE_TIMEOUT_MS = 3 * 24 * 60 * 60 * 1000; // 3 days

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

function loadFromStorage(key, fallback) {
  try {
    const val = localStorage.getItem(key);
    return val !== null ? JSON.parse(val) : fallback;
  } catch {
    return fallback;
  }
}

function clearSession() {
  ["te_token", "te_step", "te_profile", "te_identifier", "te_last_active"].forEach((k) =>
    localStorage.removeItem(k)
  );
}

function isSessionExpired() {
  const lastActive = loadFromStorage("te_last_active", null);
  if (!lastActive) return true;
  return Date.now() - lastActive > IDLE_TIMEOUT_MS;
}

function App() {
  const [identifier, setIdentifier] = useState(() => loadFromStorage("te_identifier", ""));
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [token, setToken] = useState(() => loadFromStorage("te_token", ""));
  const [destination, setDestination] = useState("");
  const [step, setStep] = useState(() => {
    const savedToken = loadFromStorage("te_token", "");
    if (!savedToken || isSessionExpired()) { clearSession(); return "email"; }
    return loadFromStorage("te_step", "home");
  });
  const [message, setMessage] = useState("Request an OTP to start the login flow.");
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");
  const [profile, setProfile] = useState(() => loadFromStorage("te_profile", { name: "", homeCity: "", budget: "", interests: [] }));
  const [profileSaving, setProfileSaving] = useState(false);

  const idleTimer = useRef(null);

  // Track activity — reset idle timer on any interaction
  useEffect(() => {
    if (!token) return;

    function onActivity() {
      localStorage.setItem("te_last_active", JSON.stringify(Date.now()));
      clearTimeout(idleTimer.current);
      idleTimer.current = setTimeout(logout, IDLE_TIMEOUT_MS);
    }

    const events = ["mousemove", "keydown", "pointerdown", "touchstart", "scroll"];
    events.forEach((e) => window.addEventListener(e, onActivity, { passive: true }));
    onActivity(); // set initial timestamp

    return () => {
      events.forEach((e) => window.removeEventListener(e, onActivity));
      clearTimeout(idleTimer.current);
    };
  }, [token]);

  function logout() {
    clearSession();
    setToken("");
    setIdentifier("");
    setProfile({ name: "", homeCity: "", budget: "", interests: [] });
    setStep("email");
    setMessage("Session expired. Please sign in again.");
  }

  function persist(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
  function updateToken(t) { setToken(t); persist("te_token", t); }
  function updateProfile(p) { setProfile(p); persist("te_profile", p); }
  function updateStep(s) { setStep(s); persist("te_step", s); }
  function updateIdentifier(v) { setIdentifier(v); persist("te_identifier", v); }

  const canVerify = useMemo(
    () => challengeId.length > 0 && otp.trim().length > 0,
    [challengeId, otp],
  );

  async function requestOtp(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("Generating OTP...");
    updateToken("");
    setDemoOtp("");

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/request-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim(), channel: "email" }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to request OTP.");

      setChallengeId(data.challengeId);
      setDestination(data.destination || "your inbox");
      setDemoOtp(data.demoOtp || "");
      setOtp("");
      updateStep("otp");
      setMessage(`OTP sent to ${data.destination}.`);
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeId, otp: otp.trim() }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || "Unable to verify OTP.");

      updateToken(data.token);
      updateIdentifier(data.user.identifier);
      setMessage(`Logged in as ${data.user.identifier} via ${data.user.channel}.`);

      if (data.isNewUser) {
        updateStep("profile");
      } else {
        updateStep("home");
        fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${data.token}` } })
          .then((r) => {
            if (r.status === 401) { logout(); return null; }
            return r.ok ? r.json() : null;
          })
          .then((d) => { if (d) updateProfile({ name: d.name ?? "", homeCity: d.homeCity ?? "", budget: d.budget ?? "", interests: d.interests ?? [] }); })
          .catch(() => {});
      }
    } catch (error) {
      setMessage(error.message);
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setProfileSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(profile),
      });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        const saved = await res.json();
        updateProfile({ name: saved.name ?? "", homeCity: saved.homeCity ?? "", budget: saved.budget ?? "", interests: saved.interests ?? [] });
      }
    } finally {
      setProfileSaving(false);
      updateStep("home");
    }
  }

  async function goToEditProfile() {
    updateStep("profile");
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.status === 401) { logout(); return; }
      if (res.ok) {
        const d = await res.json();
        updateProfile({ name: d.name ?? "", homeCity: d.homeCity ?? "", budget: d.budget ?? "", interests: d.interests ?? [] });
      }
    } catch (_) {}
  }

  return (
    <>
      {step === "home" ? (
        <Home
          profile={profile}
          identifier={identifier}
          onEditProfile={goToEditProfile}
          onLogout={logout}
        />
      ) : (
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
        {/* Left panel */}
        <section className="animate-floatIn flex flex-col rounded-3xl border border-white/15 bg-white/10 p-4 shadow-glass backdrop-blur-xl sm:p-5 lg:p-5">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-cyan-200">
            Welcome to Travel Experience AI
          </p>
          <h1 className="mt-3 font-display text-2xl leading-tight text-white sm:text-3xl md:text-4xl lg:text-[2.5rem]">
            Plan smarter trips with AI, inspired by modern travel platforms.
          </h1>
          <p className="mt-4 text-sm leading-6 text-slate-200/90">
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

        {/* Right panel */}
        <section className="animate-floatIn flex flex-col justify-center rounded-3xl border border-white/15 bg-slate-950/45 p-7 shadow-glass backdrop-blur-xl [animation-delay:120ms] sm:p-8 md:p-10 lg:p-12 xl:p-16">
          {step !== "home" ? (
            <div className="mb-6 flex items-center gap-2">
              {["email", "otp", "profile"].map((s) => (
                <div key={s} className={`h-2.5 w-10 rounded-full transition-all ${step === s ? "bg-cyan-300" : "bg-cyan-300/30"}`} />
              ))}
            </div>
          ) : null}

          <div key={step} className="animate-floatIn">
            {step === "email" && (
              <AuthEmail
                identifier={identifier}
                setIdentifier={updateIdentifier}
                loading={loading}
                onSubmit={requestOtp}
              />
            )}
            {step === "otp" && (
              <AuthOtp
                otp={otp}
                setOtp={setOtp}
                destination={destination}
                challengeId={challengeId}
                demoOtp={demoOtp}
                loading={loading}
                canVerify={canVerify}
                onSubmit={verifyOtp}
                onBack={() => updateStep("email")}
              />
            )}
            {step === "profile" && (
              <ProfileSetup
                profile={profile}
                setProfile={updateProfile}
                onSave={saveProfile}
                onSkip={() => updateStep("home")}
                saving={profileSaving}
              />
            )}
          </div>

          {step !== "profile" ? (
            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="leading-6">{message}</p>
            </div>
          ) : null}
        </section>
      </div>
    </main>
      )}
    </>
  );
}

export default App;
