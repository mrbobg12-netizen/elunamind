"use client";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Plan, UsageSummary } from "../../lib/plans";

type State = { plan: Plan; email: string; usage: UsageSummary; role?: "user" | "admin" };
type Ctx = State & { refresh: () => Promise<void> };

const C = createContext<Ctx | null>(null);

export function UsageProvider({ initial, children }: { initial: State; children: ReactNode }) {
  const [s, setS] = useState<State>(initial);
  const refresh = useCallback(async () => {
    try {
      const r = await fetch("/api/usage", { cache: "no-store" });
      if (r.ok) {
        const j = await r.json();
        setS({ plan: j.plan, email: j.email ?? "", usage: j.usage, role: j.role });
      }
    } catch { /* keep the old numbers */ }
  }, []);
  return <C.Provider value={{ ...s, refresh }}>{children}</C.Provider>;
}

export function useUsage() {
  const c = useContext(C);
  if (!c) throw new Error("useUsage must be used inside UsageProvider");
  return c;
}
