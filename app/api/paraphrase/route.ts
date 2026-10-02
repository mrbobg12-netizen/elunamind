import { NextResponse } from "next/server";
import { openai, MODEL, clean, readJson } from "../../../lib/ai";
import { guard } from "../../../lib/guard";

export async function POST(req: Request) {
  const g = await guard(req, "paraphrase");
  if (!g.ok) {
    const j = await g.res.json();
    return NextResponse.json({ paraphrased: j.error, ...j }, { status: g.res.status });
  }

  const body = await readJson(req);
  const text = clean(body.text, g.rule.maxInputChars);
  if (!text) return NextResponse.json({ paraphrased: "No text provided." }, { status: 400 });

  const blocked = await g.consume();
  if (blocked) {
    const j = await blocked.json();
    return NextResponse.json({ paraphrased: j.error, ...j }, { status: blocked.status });
  }

  try {
    const res = await openai().chat.completions.create({
      model: MODEL,
      max_tokens: g.rule.maxTokens,
      messages: [{
        role: "user",
        content: `Paraphrase the following text in clear, natural, and professional English.\nKeep the same meaning but make it smoother and more concise:\n"${text}"`,
      }],
    });
    const paraphrased = res.choices[0]?.message?.content?.trim();
    if (!paraphrased) throw new Error("Empty AI response");
    return NextResponse.json({ paraphrased });
  } catch (err) {
    console.error("paraphrase error:", err);
    await g.refund();
    return NextResponse.json({ paraphrased: "Error generating paraphrased text." }, { status: 500 });
  }
}
