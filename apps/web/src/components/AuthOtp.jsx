import { useState } from "react";

export default function AuthOtp({ otp, setOtp, destination, challengeId, demoOtp, loading, canVerify, onSubmit, onBack }) {
  const [copied, setCopied] = useState(false);

  function copyDemoOtp() {
    navigator.clipboard.writeText(demoOtp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <form onSubmit={onSubmit}>
      <h2 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">Verify OTP</h2>
      <p className="mt-3 text-base text-slate-300">Enter the OTP sent to {destination || "your email"}.</p>

      <label className="mt-5 block">
        <span className="text-base font-semibold text-slate-200">One-time password</span>
        <input
          inputMode="numeric"
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="Enter the 6-digit OTP"
          className="mt-2 h-14 w-full rounded-xl border border-white/20 bg-slate-900/80 px-4 text-base text-slate-100 outline-none transition placeholder:text-slate-400 focus:border-cyan-300"
        />
      </label>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={onBack}
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
          <p className="font-display text-lg tracking-widest text-cyan-200">Demo OTP: {demoOtp}</p>
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
  );
}
