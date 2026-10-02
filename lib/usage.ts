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
