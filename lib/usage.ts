import { supabaseAdmin } from "./supabase/admin";

// Atomically consumes 1 use for today. Returns false if the limit is reached. Fails closed on errors.
export async function consumeUsage(userId: string, kind: string, limit: number) {
  const { data, error } = await supabaseAdmin().rpc("consume_usage", {
    p_user: userId, p_kind: kind, p_limit: limit,
  });
  if (error) { console.error("consumeUsage error:", error.message); return false; }
  return data === true;
}

export async function refundUsage(userId: string, kind: string) {
  const { error } = await supabaseAdmin().rpc("refund_usage", { p_user: userId, p_kind: kind });
  if (error) console.error("refundUsage error:", error.message);
}

// Today's counters for one user, e.g. { chat: 3, notes: 1 }.
export async function getUsageToday(userId: string): Promise<Record<string, number>> {
  const day = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabaseAdmin()
    .from("usage_daily").select("kind,count").eq("user_id", userId).eq("day", day);
  if (error) { console.error("getUsageToday error:", error.message); return {}; }
  const out: Record<string, number> = {};
  for (const r of data ?? []) out[r.kind as string] = r.count as number;
  return out;
}
