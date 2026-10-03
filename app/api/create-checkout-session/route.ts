import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { stripe } from "../../../lib/stripe";

export const runtime = "nodejs";

export async function POST(req: Request) {
  try {
    // Identity comes from the session, never from the request body.
    const auth = await requireUser(req);
    if (!auth) return NextResponse.json({ error: "Please log in first." }, { status: 401 });
    if (auth.plan === "premium")
      return NextResponse.json({ error: "You're already on Premium." }, { status: 400 });

    // Demo mode: show the checkout flow without touching a payment provider.
    if (process.env.DEMO_CHECKOUT === "1") return NextResponse.json({ url: "/checkout/demo" });

    const { data: profile } = await supabaseAdmin()
      .from("profiles").select("stripe_customer_id").eq("id", auth.user.id).single();

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || new URL(req.url).origin;

    const session = await stripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: process.env.STRIPE_PRICE_ID!, quantity: 1 }],
      success_url: `${appUrl}/success`,
      cancel_url: `${appUrl}/pricing`,
      client_reference_id: auth.user.id,
      metadata: { user_id: auth.user.id },
      subscription_data: { metadata: { user_id: auth.user.id } },
      allow_promotion_codes: true,
      ...(profile?.stripe_customer_id
        ? { customer: profile.stripe_customer_id }
        : { customer_email: auth.user.email }),
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("create-checkout-session error:", err?.message || err);
    return NextResponse.json({ error: "Unable to start checkout. Please try again." }, { status: 500 });
  }
}
