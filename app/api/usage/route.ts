import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { getUsageToday } from "../../../lib/usage";
import { buildUsageSummary } from "../../../lib/plans";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const auth = await requireUser(req);
  if (!auth) return NextResponse.json({ error: "Not logged in" }, { status: 401 });
  const counts = await getUsageToday(auth.user.id);
  return NextResponse.json({
    plan: auth.plan,
    email: auth.user.email ?? "",
    usage: buildUsageSummary(auth.plan, counts),
  });
}
