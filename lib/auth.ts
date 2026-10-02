import { createSupabaseServer } from "./supabase/server";
import { supabaseAdmin } from "./supabase/admin";
import type { Plan } from "./plans";

export type AuthResult = { user: { id: string; email?: string }; plan: Plan };

// Identifies the caller from the session cookie (or an Authorization: Bearer token) and loads their plan.
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
    .from("profiles").select("plan").eq("id", user.id).single();

  return { user, plan: profile?.plan === "premium" ? "premium" : "free" };
}
