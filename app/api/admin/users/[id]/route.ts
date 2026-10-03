import { NextResponse } from "next/server";
import { supabaseAdmin } from "../../../../../lib/supabase/admin";
import { logAdmin } from "../../../../../lib/auth";
import { adminOrFail, body, str } from "../../_helpers";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const gate = await adminOrFail(req);
  if (!gate.ok) return gate.res;
  const { id } = await params;

  const { data, error } = await supabaseAdmin().rpc("admin_user_detail", { p_user: id });
  if (error) return NextResponse.json({ error: "Could not load this user." }, { status: 500 });
  if (!data?.profile) return NextResponse.json({ error: "User not found." }, { status: 404 });
  return NextResponse.json(data);
}

/**
 * Admin actions on one user:
 *   plan     -> "free" | "premium"      (manual upgrade / downgrade)
 *   status   -> "active" | "blocked"    (suspend an abusive account)
 *   role     -> "user" | "admin"        (grant or remove admin)
 *   note     -> free text               (internal note)
 *   resetUsage -> true                  (clear today's counters)
 */
export async function PATCH(req: Request, { params }: Ctx) {
  const gate = await adminOrFail(req);
  if (!gate.ok) return gate.res;
  const { id } = await params;
  const b = await body(req);
  const db = supabaseAdmin();

  const { data: target } = await db.from("profiles").select("id,email,role,plan,status").eq("id", id).single();
  if (!target) return NextResponse.json({ error: "User not found." }, { status: 404 });

  const patch: Record<string, unknown> = {};
  const done: string[] = [];

  if (b.plan === "free" || b.plan === "premium") { patch.plan = b.plan; done.push(`plan=${b.plan}`); }

  if (b.status === "active" || b.status === "blocked") {
    if (target.id === gate.admin.user.id && b.status === "blocked")
      return NextResponse.json({ error: "You cannot block your own account." }, { status: 400 });
    patch.status = b.status;
    patch.blocked_reason = b.status === "blocked" ? (str(b.reason, 200) || "Suspended by an administrator.") : null;
    done.push(`status=${b.status}`);
  }

  if (b.role === "user" || b.role === "admin") {
    if (target.id === gate.admin.user.id && b.role === "user") {
      const { count } = await db.from("profiles").select("id", { count: "exact", head: true }).eq("role", "admin");
      if ((count ?? 0) <= 1)
        return NextResponse.json({ error: "You are the only admin. Promote someone else first." }, { status: 400 });
    }
    patch.role = b.role;
    done.push(`role=${b.role}`);
  }

  if (typeof b.note === "string") { patch.admin_note = str(b.note, 1000); done.push("note"); }

  if (Object.keys(patch).length) {
    const { error } = await db.from("profiles").update(patch).eq("id", id);
    if (error) return NextResponse.json({ error: "Could not save the change." }, { status: 500 });
  }

  if (b.resetUsage === true) {
    const today = new Date().toISOString().slice(0, 10);
    await db.from("usage_daily").delete().eq("user_id", id).eq("day", today);
    done.push("usage reset");
  }

  if (!done.length) return NextResponse.json({ error: "Nothing to change." }, { status: 400 });

  await logAdmin(gate.admin, "user.update", target.email ?? id, { changes: done });
  return NextResponse.json({ ok: true, changed: done });
}
