import { createSupabaseServer } from "./supabase/server";
import { supabaseAdmin } from "./supabase/admin";
import type { Plan } from "./plans";

export type Role = "user" | "admin";
export type AuthResult = {
  user: { id: string; email?: string };
  plan: Plan;
  role: Role;
  blocked: boolean;
  blockedReason?: string;
};

// Identifies the caller from the session cookie (or an Authorization: Bearer token),
// then loads their plan, role and blocked state from the database.
export async function requireUser(req?: Request): Promise<AuthResult | null> {
  let user: { id: string; email?: string } | null = null;

  const bearer = req?.headers.get("authorization")?.replace(/^Bearer\s+/i, "").trim();
  if (bearer) {
    const { data, error } = await supabaseAdmin().auth.getUser(bearer);
    if (!error && data.user) user = { id: data.user.id, email: data.user.email };
  } else {
    const supabase = await createSupabaseServer();
    const { data, error } = await supabase.auth.getUser(); // validated by Supabase, not just decoded
    if (!error && data.user) user = { id: data.user.id, email: data.user.email };
  }
  if (!user) return null;

  const { data: profile } = await supabaseAdmin()
    .from("profiles").select("plan,role,status,blocked_reason").eq("id", user.id).single();

  return {
    user,
    plan: profile?.plan === "premium" ? "premium" : "free",
    role: profile?.role === "admin" ? "admin" : "user",
    blocked: profile?.status === "blocked",
    blockedReason: profile?.blocked_reason ?? undefined,
  };
}

/** Returns the caller only if they are an admin. Everyone else gets null. */
export async function requireAdmin(req?: Request): Promise<AuthResult | null> {
  const auth = await requireUser(req);
  if (!auth || auth.role !== "admin" || auth.blocked) return null;
  return auth;
}

/** Writes an entry to the admin audit log. Never throws. */
export async function logAdmin(
  actor: AuthResult,
  action: string,
  target?: string,
  detail?: Record<string, unknown>
) {
  try {
    await supabaseAdmin().from("admin_audit").insert({
      actor_id: actor.user.id,
      actor_email: actor.user.email ?? null,
      action,
      target: target ?? null,
      detail: detail ?? null,
    });
  } catch (err) {
    console.error("audit log failed:", err);
  }
}

/** Best-effort "last seen" stamp; failures are ignored. */
export async function touchLastSeen(userId: string) {
  try {
    await supabaseAdmin().from("profiles").update({ last_seen_at: new Date().toISOString() }).eq("id", userId);
  } catch { /* not worth failing a request over */ }
}
