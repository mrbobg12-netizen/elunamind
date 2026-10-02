import { NextResponse } from "next/server";
import { requireUser, type AuthResult } from "./auth";
import { RULES, type Feature, type Rule } from "./plans";
import { consumeUsage, refundUsage } from "./usage";

export type GuardOk = {
  ok: true;
  auth: AuthResult;
  rule: Rule;
  /** Call AFTER validating input. Returns a response if the daily limit is hit, otherwise null. */
  consume: () => Promise<NextResponse | null>;
  /** Call if the AI request fails, so the user does not lose a use. */
  refund: () => Promise<void>;
};
export type GuardFail = { ok: false; res: NextResponse };

const fail = (status: number, error: string, extra: Record<string, unknown> = {}): GuardFail => ({
  ok: false,
  res: NextResponse.json({ error, ...extra }, { status }),
});

// Step 1 of every AI route: kill switch -> login -> plan gate.
export async function guard(req: Request, feature: Feature): Promise<GuardOk | GuardFail> {
  if (process.env.AI_DISABLED === "1")
    return fail(503, "AI features are temporarily unavailable. Please try again later.");

  const auth = await requireUser(req);
  if (!auth) return fail(401, "Please log in to use this feature.");

  const rule = RULES[feature];
  const premium = auth.plan === "premium";
  if (rule.premiumOnly && !premium)
    return fail(403, `${rule.label} is available for Premium users only.`, { upgrade: true });

  const limit = premium ? rule.premiumPerDay : rule.freePerDay;
  return {
    ok: true,
    auth,
    rule,
    consume: async () => {
      const allowed = await consumeUsage(auth.user.id, feature, limit);
      if (allowed) return null;
      return premium
        ? NextResponse.json({ error: "Daily fair-use limit reached. Please try again tomorrow." }, { status: 429 })
        : NextResponse.json(
            { error: `You've used your free daily limit for ${rule.label}. Upgrade to Premium for more.`, upgrade: true },
            { status: 403 }
          );
    },
    refund: () => refundUsage(auth.user.id, feature),
  };
}
