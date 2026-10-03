import { NextResponse } from "next/server";
import { requireUser, logAdmin } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

/**
 * Demo upgrade — for showing the flow before Stripe is live.
 *
 * This hands out Premium with no payment, so it is OFF unless DEMO_CHECKOUT=1
 * is set on the server. Remove that variable the moment real payments go live.
 */
export async function POST(req: Request) {
  if (process.env.DEMO_CHECKOUT !== "1")
    return NextResponse.json({ error: "Demo checkout is not enabled." }, { status: 404 });

  const auth = await requireUser(req);
  if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
  if (auth.blocked) return NextResponse.json({ error: "This account is suspended." }, { status: 403 });
  if (auth.plan === "premium") return NextResponse.json({ ok: true, already: true });

  const { error } = await supabaseAdmin().from("profiles").update({ plan: "premium" }).eq("id", auth.user.id);
  if (error) {
    console.error("demo upgrade failed:", error.message);
    return NextResponse.json({ error: "Could not switch your plan. Please try again." }, { status: 500 });
  }

  // Leave a trail, so a demo upgrade is never mistaken for a real sale.
  await logAdmin(auth, "demo.upgrade", auth.user.email ?? auth.user.id, { note: "Demo checkout, no payment taken" });
  return NextResponse.json({ ok: true });
}
