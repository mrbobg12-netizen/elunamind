import OpenAI from "openai";

let client: OpenAI | null = null;
export function openai() {
  if (!client) client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return client;
}
export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

// Trim + cap user input.
export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

// Pull a JSON object/array out of a model reply that may contain extra text.
export function extractJson<T = any>(text: string, kind: "object" | "array"): T | null {
  const m = text.match(kind === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

export async function readJson(req: Request): Promise<any> {
  try { return await req.json(); } catch { return {}; }
}
