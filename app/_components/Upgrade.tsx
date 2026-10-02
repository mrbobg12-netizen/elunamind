"use client";
import { useState } from "react";
import { Icon } from "./Icon";

export function useUpgrade() {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  const start = async () => {
    setBusy(true); setErr("");
    try {
      const r = await fetch("/api/create-checkout-session", { method: "POST" });
      if (r.status === 401) { window.location.href = "/login?next=/pricing"; return; }
      const j = await r.json();
      if (r.ok && j.url) { window.location.href = j.url; return; }
      setErr(j.error || "Could not start checkout.");
    } catch { setErr("Network error. Please try again."); }
    setBusy(false);
  };
  return { start, busy, err };
}

export function UpgradeButton({ label = "Upgrade to Premium", className = "btn btn-primary" }: { label?: string; className?: string }) {
  const { start, busy, err } = useUpgrade();
  return (
    <span className="inline-flex flex-col items-start gap-1">
      <button type="button" className={className} onClick={start} disabled={busy}>
        {busy ? <><span className="spinner" /> Opening checkout…</> : <><Icon name="zap" size={16} /> {label}</>}
      </button>
      {err && <span className="text-xs text-red-300">{err}</span>}
    </span>
  );
}
