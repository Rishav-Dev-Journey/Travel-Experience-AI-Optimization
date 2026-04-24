import { useMemo, useState } from "react";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5080";

function normalizeIdentifier(value) {
  return value.trim();
}

function App() {
  const [identifier, setIdentifier] = useState("");
  const [otp, setOtp] = useState("");
  const [challengeId, setChallengeId] = useState("");
  const [token, setToken] = useState("");
  const [message, setMessage] = useState(
    "Request an OTP to start the login flow.",
  );
  const [loading, setLoading] = useState(false);
  const [demoOtp, setDemoOtp] = useState("");

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
      setDemoOtp(data.demoOtp || "");
      setMessage(
        `OTP sent to ${data.destination}. ${data.demoOtp ? "Use the demo OTP shown below for local testing." : "Check your email inbox."}`,
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
    <main className="relative overflow-hidden px-5 py-8 md:px-8 md:py-12">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-9rem] top-8 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl animate-pulseSoft" />
        <div className="absolute bottom-6 right-[-8rem] h-80 w-80 rounded-full bg-fuchsia-400/20 blur-3xl animate-pulseSoft" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className="animate-floatIn rounded-3xl border border-white/15 bg-white/10 p-7 shadow-glass backdrop-blur-xl md:p-10">
          <p className="font-display text-xs uppercase tracking-[0.35em] text-cyan-200">
            Travel Experience Platform
          </p>
          <h1 className="mt-3 max-w-3xl font-display text-4xl leading-tight text-white md:text-6xl">
            Fluid Email OTP Login, tuned for fast mobile sign in.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-slate-200/90 md:text-base">
            Azure-backed OTP delivery with a development fallback. Request an
            OTP, verify it, and continue with a secure tokenized session.
          </p>
        </section>

        <section className="mt-6 grid gap-4 md:grid-cols-2">
          <form
            className="animate-floatIn rounded-3xl border border-white/15 bg-slate-950/40 p-6 backdrop-blur-xl [animation-delay:120ms] md:p-7"
            onSubmit={requestOtp}
          >
            <h2 className="font-display text-xl text-white">Request OTP</h2>
            <p className="mt-2 text-sm text-slate-300">
              Use your email to receive a one-time passcode.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-200">
                Email address
              </span>
              <input
                type="email"
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                placeholder="you@example.com"
                className="mt-2 h-12 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
              />
            </label>

            <button
              type="submit"
              disabled={loading}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl bg-cyan-300 px-5 font-semibold text-slate-900 transition hover:translate-y-[-1px] hover:bg-cyan-200 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {loading ? "Working..." : "Send OTP"}
            </button>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="leading-6">{message}</p>
              {challengeId ? (
                <p className="mt-3 break-all text-xs text-slate-300">
                  Challenge ID: {challengeId}
                </p>
              ) : null}
              {demoOtp ? (
                <p className="mt-3 font-display text-lg tracking-widest text-cyan-200">
                  Demo OTP: {demoOtp}
                </p>
              ) : null}
            </div>
          </form>

          <form
            className="animate-floatIn rounded-3xl border border-white/15 bg-slate-950/40 p-6 backdrop-blur-xl [animation-delay:220ms] md:p-7"
            onSubmit={verifyOtp}
          >
            <h2 className="font-display text-xl text-white">Verify OTP</h2>
            <p className="mt-2 text-sm text-slate-300">
              Enter the passcode to complete sign in.
            </p>

            <label className="mt-5 block">
              <span className="text-sm font-semibold text-slate-200">
                One-time password
              </span>
              <input
                inputMode="numeric"
                value={otp}
                onChange={(event) => setOtp(event.target.value)}
                placeholder="Enter the 6-digit OTP"
                className="mt-2 h-12 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-fuchsia-300"
              />
            </label>

            <button
              type="submit"
              disabled={loading || !canVerify}
              className="mt-5 inline-flex h-12 w-full items-center justify-center rounded-xl border border-fuchsia-200/40 bg-fuchsia-300/20 px-5 font-semibold text-fuchsia-100 transition hover:translate-y-[-1px] hover:bg-fuchsia-300/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Working..." : "Verify OTP"}
            </button>

            <div className="mt-5 rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p className="leading-6">
                Token is returned after successful verification.
              </p>
              {token ? (
                <p className="mt-3 break-all font-mono text-xs text-emerald-200">
                  {token}
                </p>
              ) : (
                <p className="mt-3 text-xs text-slate-300">No token yet.</p>
              )}
            </div>
          </form>
        </section>
      </div>
    </main>
  );
}

export default App;
