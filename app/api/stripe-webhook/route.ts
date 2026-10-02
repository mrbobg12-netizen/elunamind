import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { stripe } from "../../../lib/stripe";
import { supabaseAdmin } from "../../../lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Match = { userId?: string | null; customerId?: string | null };

async function setPlan(match: Match, plan: "free" | "premium", extra: Record<string, unknown> = {}) {
  const db = supabaseAdmin();
  let q = db.from("profiles").update({ plan, ...extra });
  if (match.userId) q = q.eq("id", match.userId);
  else if (match.customerId) q = q.eq("stripe_customer_id", match.customerId);
  else return;
  const { error } = await q;
  if (error) throw new Error(`profiles update failed: ${error.message}`);
}

const idOf = (v: string | { id: string } | null | undefined) => (typeof v === "string" ? v : v?.id ?? null);

export async function POST(req: Request) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) return NextResponse.json({ error: "Missing stripe-signature" }, { status: 400 });

  let event: Stripe.Event;
  try {
    event = stripe().webhooks.constructEvent(await req.text(), sig, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err: any) {
    console.error("Webhook signature error:", err?.message);
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Idempotency: Stripe retries events, so process each event id only once.
  const db = supabaseAdmin();
  const { error: dup } = await db.from("stripe_events").insert({ id: event.id, type: event.type });
  if (dup?.code === "23505") return NextResponse.json({ received: true, duplicate: true });

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        if (s.mode !== "subscription") break;
        const userId = s.client_reference_id || s.metadata?.user_id;
        await setPlan({ userId }, "premium", {
          stripe_customer_id: idOf(s.customer as any),
          stripe_subscription_id: idOf(s.subscription as any),
        });
        break;
      }
      case "customer.subscription.created":
      case "customer.subscription.updated": {
        const sub = event.data.object as Stripe.Subscription;
        const match = { userId: sub.metadata?.user_id, customerId: idOf(sub.customer as any) };
        if (sub.status === "active" || sub.status === "trialing") {
          await setPlan(match, "premium", { stripe_subscription_id: sub.id });
        } else if (["canceled", "unpaid", "incomplete_expired"].includes(sub.status)) {
          await setPlan(match, "free");
        } // past_due / incomplete: keep current plan while Stripe retries the payment
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        await setPlan({ userId: sub.metadata?.user_id, customerId: idOf(sub.customer as any) }, "free");
        break;
      }
    }
    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("Webhook handler error:", err?.message || err);
    await db.from("stripe_events").delete().eq("id", event.id); // allow Stripe to retry
    return NextResponse.json({ error: "Handler failed" }, { status: 500 });
  }
}
