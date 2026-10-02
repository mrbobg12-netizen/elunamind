import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson, extractJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "qna");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const topic = clean(body.topic, g.rule.maxInputChars);
  if (!topic) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  const prompt = `
You are a helpful AI study assistant.
Generate 10 high-quality, educational Q&A pairs about the topic "${topic}".
Include:
1. 4 factual or concept questions
2. 3 application or reasoning questions
3. 2 critical thinking or analysis questions
4. 1 summary or conclusion question

Respond ONLY with a JSON array of objects like:
[ { "question": "What is ...?", "answer": "..." } ]
Keep answers short, clear, and directly useful for studying.`;

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      temperature: 0.7,
      messages: [
        { role: "system", content: "You are a precise and educational assistant." },
        { role: "user", content: prompt },
      ],
    });
    const qna = extractJson<{ question: string; answer: string }[]>(res.choices[0]?.message?.content || "", "array");
    if (!Array.isArray(qna) || qna.length === 0) throw new Error("Invalid Q&A format");
    return NextResponse.json({ qna });
  } catch (err) {
    console.error("qna error:", err);
    await g.refund();
    return NextResponse.json({ error: "Failed to generate valid Q&A." }, { status: 500 });
  }
}
