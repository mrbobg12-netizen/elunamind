"use client";
import Link from "next/link";
import { use, useCallback, useEffect, useState } from "react";
import { Icon } from "../../../_components/Icon";
import { Card, Confirm, Empty, Field, Loading, Page, Pill, Stat, useToast } from "../../ui";

type Profile = {
  id: string; email: string; plan: string; role: string; status: string;
  blocked_reason: string | null; admin_note: string | null;
  created_at: string; last_seen_at: string | null; stripe_customer_id: string | null;
};
type Detail = {
  profile: Profile;
  usage_today: Record<string, number>;
  usage_total: Record<string, number>;
  last_14_days: { day: string; uses: number }[];
  chats: { id: string; title: string; updated_at: string; messages: number }[];
  notes: { id: string; title: string; created_at: string }[];
};

const LABELS: Record<string, string> = {
  chat: "Chat", notes: "Notes", qna: "Q&A", studyPlan: "Study plan", career: "Career",
  flashcards: "Flashcards", test: "Tests", visualMap: "Mind maps", presentation: "Slides",
  grammar: "Grammar", paraphrase: "Paraphrase", citations: "Citations",
};

export default function UserDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [d, setD] = useState<Detail | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [reason, setReason] = useState("");
  const [ask, setAsk] = useState<null | { kind: "block" | "unblock" | "admin" | "unadmin" | "reset" }>(null);
  const { toast, toastNode } = useToast();

  const load = useCallback(async () => {
    setError("");
    try {
      const r = await fetch(`/api/admin/users/${id}`, { cache: "no-store" });
      const j = await r.json();
      if (!r.ok) { setError(j.error || "Could not load this user."); return; }
      setD(j); setNote(j.profile.admin_note ?? "");
    } catch { setError("Network problem. Reload the page to try again."); }
  }, [id]);

  useEffect(() => { load(); }, [load]);

  async function patch(payload: Record<string, unknown>, okMsg: string) {
    setBusy(true);
    try {
      const r = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload),
      });
      const j = await r.json();
      if (!r.ok) { toast(j.error || "That change did not save.", true); return; }
      toast(okMsg); await load();
    } catch { toast("Network problem. Nothing was changed.", true); }
    finally { setBusy(false); setAsk(null); }
  }

  if (error) return <Page title="User"><Card><p className="text-sm text-red-200">{error}</p></Card></Page>;
  if (!d) return <Page title="User"><Loading rows={5} /></Page>;

  const p = d.profile;
  const maxDay = Math.max(1, ...d.last_14_days.map((x) => x.uses));
  const totalUses = Object.values(d.usage_total).reduce((a, b) => a + b, 0);
  const fmt = (s: string | null) => (s ? new Date(s).toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }) : "Never");

  const confirmText = {
    block: { title: "Block this account?", message: "They will be signed out of every AI tool and shown the reason you set.", label: "Block account", danger: true },
    unblock: { title: "Unblock this account?", message: "They get their normal plan access back immediately.", label: "Unblock", danger: false },
    admin: { title: "Make this user an admin?", message: "They will be able to see every user's data and change pricing, limits and content.", label: "Grant admin", danger: true },
    unadmin: { title: "Remove admin access?", message: "They keep their account but lose the admin panel.", label: "Remove admin", danger: true },
    reset: { title: "Reset today's usage?", message: "Their daily counters go back to zero, so they can use every tool again today.", label: "Reset usage", danger: false },
  };

  return (
    <Page
      title={p.email || "User"}
      sub={`Joined ${fmt(p.created_at)} · last seen ${fmt(p.last_seen_at)}`}
      actions={<Link href="/admin/users" className="btn btn-ghost btn-sm">← All users</Link>}
    >
      {toastNode}
      <div className="mb-5 flex flex-wrap gap-2">
        <Pill tone={p.plan === "premium" ? "premium" : "free"}>{p.plan === "premium" ? "Premium" : "Free plan"}</Pill>
        {p.role === "admin" && <Pill tone="admin">Admin</Pill>}
        {p.status === "blocked" && <Pill tone="blocked">Blocked</Pill>}
        {p.stripe_customer_id && <span className="chip">Stripe customer</span>}
      </div>

      {p.status === "blocked" && p.blocked_reason && (
        <div className="mb-5 rounded-xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-100">
          Blocked: {p.blocked_reason}
        </div>
      )}

      <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat label="Uses today" value={Object.values(d.usage_today).reduce((a, b) => a + b, 0)} />
            <Stat label="Uses all time" value={totalUses} />
            <Stat label="Chats · notes" value={`${d.chats.length} · ${d.notes.length}`} />
          </div>

          <Card>
            <h2 className="mb-4 font-display text-lg text-paper">Last 14 days</h2>
            {d.last_14_days.length === 0 ? <Empty>No activity yet.</Empty> : (
              <div className="flex h-28 items-end gap-1.5">
                {d.last_14_days.map((x) => (
                  <div key={x.day} className="group relative flex flex-1 flex-col items-center justify-end">
                    <div className="w-full rounded-t bg-lamp transition-[height] duration-500" style={{ height: `${Math.max((x.uses / maxDay) * 100, 4)}%` }} />
                    <span className="pointer-events-none absolute -top-7 hidden whitespace-nowrap rounded-lg border border-white/15 bg-[#121a30] px-2 py-1 text-xs text-paper group-hover:block">
                      {new Date(x.day).toLocaleDateString(undefined, { month: "short", day: "numeric" })}: {x.uses}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-lg text-paper">Usage by tool</h2>
            {totalUses === 0 ? <Empty>This user has not used any tool yet.</Empty> : (
              <ul className="space-y-2.5">
                {Object.entries(d.usage_total).sort((a, b) => b[1] - a[1]).map(([k, v]) => (
                  <li key={k} className="flex items-center gap-3 text-sm">
                    <span className="w-28 shrink-0 text-paper/85">{LABELS[k] ?? k}</span>
                    <span className="h-2 flex-1 overflow-hidden rounded-full bg-white/10">
                      <span className="block h-full rounded-full bg-lamp" style={{ width: `${(v / Math.max(...Object.values(d.usage_total))) * 100}%` }} />
                    </span>
                    <span className="w-20 shrink-0 text-right text-muted">{v} total{d.usage_today[k] ? ` · ${d.usage_today[k]} today` : ""}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <div className="grid gap-5 sm:grid-cols-2">
            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-display text-base text-paper"><Icon name="chat" size={16} className="text-lamp" /> Recent chats</h2>
              {d.chats.length === 0 ? <Empty>No chats.</Empty> : (
                <ul className="space-y-1.5">
                  {d.chats.slice(0, 8).map((c) => (
                    <li key={c.id} className="flex items-baseline justify-between gap-3 text-sm">
                      <span className="min-w-0 flex-1 truncate text-paper/85">{c.title}</span>
                      <span className="shrink-0 text-xs text-muted">{c.messages} msg</span>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-3 text-xs text-muted">Titles only. Message content is not shown here.</p>
            </Card>
            <Card>
              <h2 className="mb-3 flex items-center gap-2 font-display text-base text-paper"><Icon name="notes" size={16} className="text-lamp" /> Recent notes</h2>
              {d.notes.length === 0 ? <Empty>No notes.</Empty> : (
                <ul className="space-y-1.5">
                  {d.notes.slice(0, 8).map((n) => (
                    <li key={n.id} className="truncate text-sm text-paper/85">{n.title}</li>
                  ))}
                </ul>
              )}
            </Card>
          </div>
        </div>

        {/* actions */}
        <aside className="space-y-5">
          <Card>
            <h2 className="mb-4 font-display text-base text-paper">Plan</h2>
            <div className="flex gap-2">
              {(["free", "premium"] as const).map((pl) => (
                <button key={pl} type="button" disabled={busy || p.plan === pl}
                  onClick={() => patch({ plan: pl }, `Moved to the ${pl} plan.`)}
                  className={`btn btn-sm flex-1 ${p.plan === pl ? "btn-primary" : "btn-ghost"}`}>
                  {pl === "free" ? "Free" : "Premium"}
                </button>
              ))}
            </div>
            <p className="mt-2 text-xs text-muted">A manual change here does not touch their Stripe subscription.</p>
          </Card>

          <Card>
            <h2 className="mb-4 font-display text-base text-paper">Account</h2>
            <div className="space-y-2.5">
              {p.status === "active" ? (
                <>
                  <Field label="Reason (shown to them)">
                    <input className="input" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Automated abuse of the free plan" />
                  </Field>
                  <button type="button" className="btn btn-ghost btn-sm w-full !border-red-400/40 !text-red-200" disabled={busy} onClick={() => setAsk({ kind: "block" })}>
                    <Icon name="ban" size={14} /> Block account
                  </button>
                </>
              ) : (
                <button type="button" className="btn btn-primary btn-sm w-full" disabled={busy} onClick={() => setAsk({ kind: "unblock" })}>
                  <Icon name="check" size={14} /> Unblock account
                </button>
              )}
              <button type="button" className="btn btn-ghost btn-sm w-full" disabled={busy} onClick={() => setAsk({ kind: "reset" })}>
                <Icon name="refresh" size={14} /> Reset today&apos;s usage
              </button>
              <button type="button" className="btn btn-ghost btn-sm w-full" disabled={busy}
                onClick={() => setAsk({ kind: p.role === "admin" ? "unadmin" : "admin" })}>
                <Icon name="shield" size={14} /> {p.role === "admin" ? "Remove admin" : "Make admin"}
              </button>
            </div>
          </Card>

          <Card>
            <h2 className="mb-3 font-display text-base text-paper">Internal note</h2>
            <textarea className="input" rows={4} value={note} onChange={(e) => setNote(e.target.value)} placeholder="Only admins see this." />
            <button type="button" className="btn btn-ghost btn-sm mt-2 w-full" disabled={busy || note === (p.admin_note ?? "")}
              onClick={() => patch({ note }, "Note saved.")}>
              <Icon name="save" size={14} /> Save note
            </button>
          </Card>
        </aside>
      </div>

      {ask && (
        <Confirm
          open
          title={confirmText[ask.kind].title}
          message={confirmText[ask.kind].message}
          confirmLabel={confirmText[ask.kind].label}
          danger={confirmText[ask.kind].danger}
          onCancel={() => setAsk(null)}
          onConfirm={() => {
            if (ask.kind === "block") patch({ status: "blocked", reason }, "Account blocked.");
            if (ask.kind === "unblock") patch({ status: "active" }, "Account unblocked.");
            if (ask.kind === "admin") patch({ role: "admin" }, "Admin access granted.");
            if (ask.kind === "unadmin") patch({ role: "user" }, "Admin access removed.");
            if (ask.kind === "reset") patch({ resetUsage: true }, "Today's usage reset.");
          }}
        />
      )}
    </Page>
  );
}
