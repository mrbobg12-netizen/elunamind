import OpenAI from "openai";

/**
 * Provider switch (no code change needed to go from free -> paid):
 *
 *  FREE (Gemini):  OPENAI_API_KEY=<Gemini key>
 *                  OPENAI_BASE_URL=https://generativelanguage.googleapis.com/v1beta/openai/
 *                  OPENAI_MODEL=gemini-2.5-flash
 *
 *  PAID (OpenAI):  OPENAI_API_KEY=<OpenAI key>
 *                  (leave OPENAI_BASE_URL empty)
 *                  OPENAI_MODEL=gpt-4o-mini
 */
const BASE_URL = process.env.OPENAI_BASE_URL || undefined;
const COMPAT = !!BASE_URL; // true when using a non-OpenAI, OpenAI-compatible provider

let client: OpenAI | null = null;

export function openai() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY, baseURL: BASE_URL });
    if (COMPAT) patchForCompat(client);
  }
  return client;
}

export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Other providers can differ on a few parameters, so adapt requests in ONE place.
function patchForCompat(c: OpenAI) {
  const completions: any = c.chat.completions;
  const original = completions.create.bind(completions);
  const multiplier = Number(process.env.AI_TOKEN_MULTIPLIER || 3); // "thinking" models can spend output tokens internally

  completions.create = (params: any, options?: any) => {
    const p = { ...params };

    if (p.max_tokens) p.max_tokens = Math.ceil(p.max_tokens * multiplier);

    // Strict structured outputs may not be supported: fall back to "reply with JSON" in the prompt.
    const rf = p.response_format;
    if (rf) {
      delete p.response_format;
      if (rf.type === "json_schema" && rf.json_schema?.schema) {
        const hint = `\n\nRespond with ONLY valid JSON (no markdown, no commentary) matching this JSON schema:\n${JSON.stringify(rf.json_schema.schema)}`;
        const msgs = [...p.messages];
        for (let i = msgs.length - 1; i >= 0; i--) {
          if (msgs[i].role === "user") { msgs[i] = { ...msgs[i], content: msgs[i].content + hint }; break; }
        }
        p.messages = msgs;
      } else if (rf.type === "json_object") {
        p.messages = [...p.messages, { role: "user", content: "Reply with ONLY valid JSON. No markdown, no commentary." }];
      }
    }
    return original(p, options);
  };
}

// Trim + cap user input.
export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Pull a JSON object/array out of a model reply that may contain extra text.
export function extractJson<T = any>(text: string, kind: "object" | "array"): T | null {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const m = cleaned.match(kind === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

export async function readJson(req: Request): Promise<any> {
  try { return await req.json(); } catch { return {}; }
}
