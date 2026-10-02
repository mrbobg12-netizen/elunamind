import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson, extractJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "visualMap");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const topic = clean(body.topic, g.rule.maxInputChars);
  if (!topic) return NextResponse.json({ error: "Missing topic." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  const prompt = `
Generate a structured JSON object for an AI knowledge map about "${topic}".
Each node must include:
- id (unique short id)
- label (concept title)
- details (2-3 sentence explanation)
Also return edges connecting them logically.
Example format:
{
  "nodes": [
    {"id":"1","label":"Causes","details":"The main reasons ..."},
    {"id":"2","label":"Effects","details":"The consequences ..."}
  ],
  "edges":[{"from":"1","to":"2"}]
}`;

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });
    const parsed = extractJson<{ nodes: unknown[]; edges: unknown[] }>(res.choices[0]?.message?.content || "", "object");
    if (!parsed || !Array.isArray(parsed.nodes) || !Array.isArray(parsed.edges)) throw new Error("Bad map shape");
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("visual-map error:", err);
    await g.refund();
    return NextResponse.json({ error: "Failed to generate the map. Please try again." }, { status: 500 });
  }
}
