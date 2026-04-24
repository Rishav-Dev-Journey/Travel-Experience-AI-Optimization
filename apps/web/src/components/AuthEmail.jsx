export default function AuthEmail({ identifier, setIdentifier, loading, onSubmit }) {
  return (
    <form onSubmit={onSubmit}>
      <h2 className="font-display text-4xl text-white md:text-5xl lg:text-6xl">Sign in with Email</h2>
      <p className="mt-3 text-base text-slate-300">Enter your email to receive a one-time password.</p>

      <label className="mt-5 block">
        <span className="text-base font-semibold text-slate-200">Email address</span>
        <input
          type="email"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
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
  );
}
