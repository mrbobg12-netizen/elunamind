import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson, extractJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "presentation"); // plan comes from the database, never from the request body
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const topic = clean(body.topic, g.rule.maxInputChars);
  const slideCount = Math.min(12, Math.max(5, Number(body.slides) || 10));
  if (!topic) return NextResponse.json({ error: "Topic is required." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  const prompt = `
You are SlideCraft, an elite slide writer. Create a JSON with exactly this shape:
{ "slides": [ { "title": "...", "bullets": ["...", "...", "..."], "notes": "..." } ] }

Rules:
- ${slideCount} slides.
- Titles short and informative.
- Bullets: concrete facts, cause->effect, definitions, examples, stats if relevant.
- No markdown symbols (#, *, -). Plain text only.
- Keep bullets punchy (5-12 words).
- First slide = title slide. Final slide = summary / next steps.
Topic: "${topic}"`;

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      temperature: 0.4,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "Respond with STRICT JSON only. No prose." },
        { role: "user", content: prompt },
      ],
    });
    const json = extractJson<{ slides: any[] }>(res.choices[0]?.message?.content || "", "object");
    if (!json || !Array.isArray(json.slides) || json.slides.length === 0) throw new Error("Invalid slides");
    const slides = json.slides.slice(0, 15).map((s: any) => ({
      title: String(s?.title || "Slide"),
      bullets: Array.isArray(s?.bullets) ? s.bullets.map((b: any) => String(b)) : [],
      notes: s?.notes ? String(s.notes) : "",
    }));
    return NextResponse.json({ slides });
  } catch (err) {
    console.error("presentation error:", err);
    await g.refund();
    return NextResponse.json({ error: "Failed to generate the presentation." }, { status: 500 });
  }
}
