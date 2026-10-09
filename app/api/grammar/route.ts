import { NextResponse } from "next/server";
import { MODEL, clean, complete, extractJson, readJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";
import { captureRouteError } from "../../../lib/errors";

export async function POST(req: Request) {
  const g = await guard(req, "grammar");
  if (!g.ok) return g.res;

  const body = await readJson(req);
  const text = clean(body.text, g.rule.maxInputChars);
  const tone = clean(body.tone, 40) || "neutral";
  if (!text) return NextResponse.json({ error: "Missing text input." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) return blocked;

  const prompt = `
You are a professional grammar corrector and tone improver.
Fix grammar, punctuation, and clarity while keeping the same meaning.
Use the following tone: ${tone}.
Return JSON with these keys:
{
  "corrected": "the full corrected text",
  "changes": [ { "from": "wrong text", "to": "corrected text", "reason": "why the change was made" } ]
}
Respond only in valid JSON.
Text:
${text}`;

  try {
    const res = await complete({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      temperature: 0.3,
      response_format: { type: "json_object" },
      messages: [{ role: "user", content: prompt }],
    });
    const parsed = extractJson(res.choices[0]?.message?.content || "", "object");
    if (!parsed) throw new Error("Invalid response from model");
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("grammar error:", err);
    captureRouteError(err, req, { route: "/api/grammar", status: 500 });
    await g.refund();
    return NextResponse.json({ error: "Failed to check grammar." }, { status: 500 });
  }
}
