import { NextResponse } from "next/server";
import { requireUser } from "../../../../lib/auth";
import { supabaseAdmin } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";
type Ctx = { params: Promise<{ id: string }> };

export async function GET(req: Request, { params }: Ctx) {
  const auth = await requireUser(req);
  if (!auth) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const db = supabaseAdmin();
  const { data: chat } = await db.from("chats").select("id,title").eq("id", id).eq("user_id", auth.user.id).maybeSingle();
  if (!chat) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  const { data } = await db.from("chat_messages").select("id,role,content,created_at")
    .eq("chat_id", id).order("created_at", { ascending: true }).limit(500);
  return NextResponse.json({ chat, messages: data ?? [] });
}

export async function DELETE(req: Request, { params }: Ctx) {
  const auth = await requireUser(req);
  if (!auth) return NextResponse.json({ error: "Please log in." }, { status: 401 });
  const { id } = await params;
  const { error } = await supabaseAdmin().from("chats").delete().eq("id", id).eq("user_id", auth.user.id);
  if (error) return NextResponse.json({ error: "Could not delete." }, { status: 500 });
  return NextResponse.json({ ok: true });
}
