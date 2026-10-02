"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase/browser";
import { Icon } from "../_components/Icon";
import { Logo } from "../_components/Logo";

const GOOGLE = process.env.NEXT_PUBLIC_GOOGLE_AUTH === "1";

function safeNext(v: string | null) {
  return v && v.startsWith("/") && !v.startsWith("//") ? v : "/dashboard";
}

export function LoginForm() {
  const sp = useSearchParams();
  const next = safeNext(sp.get("next"));
  const [mode, setMode] = useState<"signin" | "signup">(sp.get("mode") === "signup" ? "signup" : "signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(sp.get("error") ? "Sign-in failed. Please try again." : "");
  const [info, setInfo] = useState("");

  // already signed in -> go straight in
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => { if (data.user) window.location.replace(next); }).catch(() => {});
  }, [next]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(""); setInfo("");
    if (password.length < 6) { setError("Password must be at least 6 characters."); return; }
    setBusy(true);
    try {
      if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (error) { setError(error.message); return; }
        window.location.assign(next);
      } else {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(), password,
          options: { emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
        });
        if (error) { setError(error.message); return; }
        if (data.session) window.location.assign(next);
        else setInfo("Account created! Check your email and click the confirmation link to continue.");
      }
    } catch { setError("Network error. Please try again."); }
    finally { setBusy(false); }
  }

  async function google() {
    setError("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (error) setError(error.message);
  }

  return (
    <div className="relative grid min-h-dvh lg:grid-cols-2">
      {/* brand panel */}
      <div className="relative hidden overflow-hidden border-r border-white/[0.07] p-12 lg:flex lg:flex-col lg:justify-between">
        <div className="grid-bg absolute inset-0" />
        <div className="orb -left-10 top-20 h-72 w-72 bg-violet-600/50" />
        <div className="orb bottom-0 right-0 h-72 w-72 bg-cyan-500/30" style={{ animationDelay: "-6s" }} />
        <div className="relative"><Logo /></div>
        <div className="relative max-w-md">
          <h2 className="text-4xl font-bold leading-tight text-white">Your AI study companion is <span className="gradient-text">one click away</span>.</h2>
          <ul className="mt-8 space-y-4 text-slate-300">
            {["AI tutor chat that explains step by step", "Smart notes, Q&A practice and study plans", "Free plan included, no card needed"].map((t) => (
              <li key={t} className="flex items-center gap-3"><span className="grid h-6 w-6 place-items-center rounded-full bg-emerald-500/20 text-emerald-300"><Icon name="check" size={14} /></span>{t}</li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-mute">© {new Date().getFullYear()} Eluna Mind</p>
      </div>

      {/* form */}
      <div className="relative flex items-center justify-center px-4 py-10">
        <div className="orb -right-10 -top-10 h-56 w-56 bg-violet-600/30 lg:hidden" />
        <div className="pop-in relative w-full max-w-md">
          <div className="mb-8 lg:hidden"><Logo /></div>
          <h1 className="text-3xl font-bold text-white">{mode === "signin" ? "Welcome back" : "Create your free account"}</h1>
          <p className="mt-2 text-sm text-mute">{mode === "signin" ? "Log in to continue studying." : "Start learning in under a minute."}</p>

          <div className="mt-6 flex gap-1 rounded-xl bg-white/5 p-1">
            {(["signin", "signup"] as const).map((m) => (
              <button key={m} type="button" onClick={() => { setMode(m); setError(""); setInfo(""); }} className={`flex-1 rounded-lg py-2 text-sm font-medium transition ${mode === m ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow" : "text-mute hover:text-white"}`}>
                {m === "signin" ? "Log in" : "Sign up"}
              </button>
            ))}
          </div>

          {GOOGLE && (
            <>
              <button type="button" onClick={google} className="btn btn-ghost mt-5 w-full !py-3">
                <svg width="18" height="18" viewBox="0 0 48 48" aria-hidden="true"><path fill="#FFC107" d="M43.6 20.1H42V20H24v8h11.3C33.7 32.7 29.2 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 13 4 4 13 4 24s9 20 20 20 20-9 20-20c0-1.3-.1-2.6-.4-3.9z" /><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 15.1 19 12 24 12c3.1 0 5.8 1.2 8 3l5.7-5.7C34 6.1 29.3 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" /><path fill="#4CAF50" d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.2 35.1 26.7 36 24 36c-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.5 39.6 16.2 44 24 44z" /><path fill="#1976D2" d="M43.6 20.1H42V20H24v8h11.3c-.8 2.2-2.2 4.2-4.1 5.6l6.2 5.2C37 39.2 44 34 44 24c0-1.3-.1-2.6-.4-3.9z" /></svg>
                Continue with Google
              </button>
              <div className="my-5 flex items-center gap-3 text-xs text-mute"><span className="h-px flex-1 bg-white/10" />or with email<span className="h-px flex-1 bg-white/10" /></div>
            </>
          )}

          <form onSubmit={submit} className={`space-y-4 ${GOOGLE ? "" : "mt-5"}`}>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-200">Email</span>
              <input className="input" type="email" autoComplete="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
            <label className="block"><span className="mb-1.5 block text-sm font-medium text-slate-200">Password</span>
              <input className="input" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></label>
            {error && <p role="alert" className="pop-in rounded-xl border border-red-400/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</p>}
            {info && <p className="pop-in rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-sm text-emerald-100">{info}</p>}
            <button type="submit" className="btn btn-primary w-full !py-3.5" disabled={busy}>{busy ? <><span className="spinner" /> Please wait…</> : mode === "signin" ? "Log in" : "Create account"}</button>
          </form>
          <p className="mt-6 text-center text-sm text-mute"><Link href="/" className="hover:text-white">← Back to home</Link></p>
        </div>
      </div>
    </div>
  );
}
