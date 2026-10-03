import { NextResponse } from "next/server";
import { requireAdmin, type AuthResult } from "../../../lib/auth";

/** Every admin route starts here. Returns the admin, or a 403/401 response. */
export async function adminOrFail(req: Request): Promise<{ ok: true; admin: AuthResult } | { ok: false; res: NextResponse }> {
  const admin = await requireAdmin(req);
  if (!admin) {
    return { ok: false, res: NextResponse.json({ error: "Admin access required." }, { status: 403 }) };
  }
  return { ok: true, admin };
}

export async function body(req: Request): Promise<Record<string, unknown>> {
  try { return (await req.json()) as Record<string, unknown>; } catch { return {}; }
}

export const str = (v: unknown, max = 500) => (typeof v === "string" ? v.trim().slice(0, max) : "");
