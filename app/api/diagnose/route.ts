import { NextResponse } from "next/server";
import { requireUser } from "../../../lib/auth";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { getSettings } from "../../../lib/settings";

export const dynamic = "force-dynamic";

/**
 * Self-check for the signed-in user. Shows which database the server is talking to,
 * what it thinks this account is, and whether each piece of the schema is present.
 * Requires a login and exposes no secrets — only the project reference, which is
 * already public (it is part of the Supabase URL the browser uses).
 */
export async function GET(req: Request) {
  const auth = await requireUser(req);
  if (!auth) return NextResponse.json({ error: "Log in first, then open this page again." }, { status: 401 });

  const db = supabaseAdmin();
  const projectRef = (process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/^https?:\/\//, "").split(".")[0];

  // Does this user actually have a profile row, and what is in it?
  const { data: profile, error: profileErr } = await db
    .from("profiles").select("id,email,plan,role,status").eq("id", auth.user.id).maybeSingle();

  // Can the server run the limit function at all? (0 limit never consumes anything)
  const probe = await db.rpc("consume_usage", { p_user: auth.user.id, p_kind: "__probe__", p_limit: 0 });

  const tableCheck = async (name: string) => {
    const { error } = await db.from(name).select("*", { count: "exact", head: true }).limit(1);
    return error ? `MISSING (${error.message})` : "OK";
  };

  const [usageDaily, chats, notes, appSettings] = await Promise.all([
    tableCheck("usage_daily"), tableCheck("chats"), tableCheck("notes_history"), tableCheck("app_settings"),
  ]);

  const { data: admins } = await db.from("profiles").select("email").eq("role", "admin");
  const settings = await getSettings();

  return NextResponse.json({
    whatTheServerSees: {
      supabaseProject: projectRef,
      yourEmail: auth.user.email ?? null,
      yourUserId: auth.user.id,
      yourRole: auth.role,
      yourPlan: auth.plan,
      canOpenAdminPanel: auth.role === "admin",
    },
    yourProfileRow: profileErr ? `ERROR: ${profileErr.message}` : profile ?? "NO ROW FOUND for your user id",
    adminAccountsInThisDatabase: (admins ?? []).map((a) => a.email),
    schema: {
      usage_daily: usageDaily,
      chats,
      notes_history: notes,
      app_settings: appSettings,
      consume_usage_function: probe.error ? `BROKEN: ${probe.error.message}` : "OK",
    },
    limits: {
      chatFreePerDay: settings.rules.chat.freePerDay,
      notesFreePerDay: settings.rules.notes.freePerDay,
      aiPaused: settings.flags.aiDisabled,
    },
  });
}
