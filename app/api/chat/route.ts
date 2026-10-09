import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";
import { supabaseAdmin } from "../../../lib/supabase/admin";
import { contextFromUpload, getOwnedUpload } from "../../../lib/uploads";
import { captureRouteError } from "../../../lib/errors";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const SYSTEM = `You are Eluna, a friendly and sharp AI study tutor inside the Eluna Mind app.
- Explain step by step, in simple language, with short examples.
- Reply in the same language the student writes in.
- Use short paragraphs, bullet points and **bold** key terms.
- Write every formula, equation or symbol in LaTeX: $x^2$ inline, $$...$$ on its own line. Never write maths as plain text like "x^2" or "sqrt(x)".
- Put code in fenced blocks with the language, like \`\`\`python.
- Use a markdown table when comparing three or more things.
- If a question is unclear, make a sensible assumption and say so, or ask one short clarifying question.
- For homework, guide the student to understand rather than only dumping the final answer.
- Be honest when you are not sure. Do not invent facts, sources or quotes.`;

export async function POST(req: Request) {
  const g = await guard(req, "chat");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const message = clean(body.message, g.rule.maxInputChars);
  if (!message) return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });

  const db = supabaseAdmin();
  const userId = g.auth.user.id;
  let chatId: string | null = typeof body.chatId === "string" ? body.chatId : null;

  if (chatId) {
    const { data: own } = await db.from("chats").select("id").eq("id", chatId).eq("user_id", userId).maybeSingle();
    if (!own) return NextResponse.json({ error: "Chat not found." }, { status: 404 });
  }

  // An attached file: its text joins the prompt as context, not as the question.
  const uploadId = typeof body.uploadId === "string" ? body.uploadId : null;
  let fileContext = "";
  let fileName = "";
  if (uploadId) {
    const up = await getOwnedUpload(userId, uploadId);
    if (!up) return NextResponse.json({ error: "That file is no longer available." }, { status: 404 });
    if (up.status !== "ready")
      return NextResponse.json({ error: "That file is still being read. Give it a moment and try again." }, { status: 409 });
    fileContext = contextFromUpload(up);
    fileName = up.file_name;
    if (!fileContext)
      return NextResponse.json({
        error: up.kind === "audio"
          // An uploaded recording has no text until the transcript tool has run.
          ? "Recordings need transcribing first. Open Lecture Transcripts, run this file, and then ask about it here."
          : "No readable text was found in that file, so I cannot answer about it.",
      }, { status: 422 });
  }

  const blocked = await g.consume();
  if (blocked) return blocked;

  try {
    if (!chatId) {
      const title = (fileName ? `${fileName} — ${message}` : message).replace(/\s+/g, " ").slice(0, 60);
      const { data, error } = await db.from("chats").insert({ user_id: userId, title }).select("id").single();
      if (error || !data) throw new Error(error?.message || "Could not create chat");
      chatId = data.id as string;
    }

    const { data: hist } = await db
      .from("chat_messages").select("role,content").eq("chat_id", chatId)
      .order("created_at", { ascending: false }).limit(12);
    const history = (hist ?? []).reverse() as { role: "user" | "assistant"; content: string }[];

    // upload_id is only sent when a file is attached, so chat keeps working on a
    // database where migration 006 has not been run yet.
    await db.from("chat_messages").insert({
      chat_id: chatId, user_id: userId, role: "user", content: message,
      ...(uploadId ? { upload_id: uploadId } : {}),
    });

    const stream = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      temperature: 0.6,
      stream: true,
      messages: [
        { role: "system", content: SYSTEM },
        ...history,
        // Last, so the file is the freshest thing in context when the question is about it.
        ...(fileContext ? [{ role: "system" as const, content: fileContext }] : []),
        { role: "user", content: message },
      ],
    });

    const encoder = new TextEncoder();
    const cid = chatId;
    let full = "";

    const rs = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            const t = chunk.choices[0]?.delta?.content;
            if (t) { full += t; controller.enqueue(encoder.encode(t)); }
          }
          if (!full.trim()) throw new Error("Empty AI response");
        } catch (err) {
          console.error("chat stream error:", err);
          if (!full.trim()) {
            await g.refund();
            try { controller.enqueue(encoder.encode("\n[[ERROR]]")); } catch {}
          }
        }
        if (full.trim()) {
          await db.from("chat_messages").insert({ chat_id: cid, user_id: userId, role: "assistant", content: full });
          await db.from("chats").update({ updated_at: new Date().toISOString() }).eq("id", cid);
        }
        try { controller.close(); } catch {}
      },
    });

    return new Response(rs, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-store, no-transform",
        "X-Accel-Buffering": "no",
        "X-Chat-Id": cid,
      },
    });
  } catch (err) {
    console.error("chat error:", err);
    captureRouteError(err, req, { route: "/api/chat", status: 500 });
    await g.refund();
    return NextResponse.json({ error: "Could not reach the AI right now. Please try again." }, { status: 500 });
  }
}
