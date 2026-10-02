import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "notes");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const text = clean(body.text, g.rule.maxInputChars);
  if (!text) return NextResponse.json({ error: "Text cannot be empty." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      messages: [
        { role: "system", content: "You are an AI assistant that generates clean, structured, and detailed study notes." },
        { role: "user", content: `Generate detailed, structured study notes from this text:\n\n${text}` },
      ],
    });
    const notes = res.choices[0]?.message?.content;
    if (!notes) throw new Error("Empty AI response");
    return NextResponse.json({ notes });
  } catch (err) {
    console.error("notes error:", err);
    await g.refund();
    return NextResponse.json({ error: "Failed to generate notes." }, { status: 500 });
  }
}
