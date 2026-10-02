import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson, extractJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "flashcards");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const topic = clean(body.topic, g.rule.maxInputChars);
  if (!topic) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  const prompt = `
You are a flashcard generator.
Create exactly 5 flashcards about "${topic}".
Each flashcard must have a "question" and "answer" field.
Reply ONLY in valid JSON array format, like this:
[ {"question": "What is AI?", "answer": "Artificial Intelligence"} ]
Do NOT include extra text before or after JSON.`;

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      messages: [{ role: "user", content: prompt }],
    });
    const flashcards = extractJson<{ question: string; answer: string }[]>(res.choices[0]?.message?.content || "", "array");
    if (!Array.isArray(flashcards) || flashcards.length === 0) throw new Error("Invalid flashcards format");
    return NextResponse.json({ flashcards });
  } catch (err) {
    console.error("flashcards error:", err);
    await g.refund();
    return NextResponse.json({ error: "Failed to generate flashcards." }, { status: 500 });
  }
}
