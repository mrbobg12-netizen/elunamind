import OpenAI from "openai";
import { supabaseAdmin } from "./supabase/admin";

/**
 * The AI layer.
 *
 * Keys come from the admin panel (the `ai_providers` table) and fall back to
 * the environment variables, so the app still works before anything is set up
 * and still works if the database is briefly unreachable.
 *
 * Two things this buys that a single env var cannot:
 *   - changing a key, a model or a provider takes a save, not a redeploy;
 *   - more than one key can be listed, and a dead or rate-limited one fails
 *     over to the next instead of taking every AI feature down.
 *
 * Keys never leave the server. The admin API returns a masked preview only.
 */

export type Provider = {
  id: string | null;          // null = the one built from environment variables
  label: string;
  apiKey: string;
  baseUrl: string;            // "" = OpenAI itself
  model: string;
  transcribeModel: string;
};

const CACHE_MS = 30_000;
let cache: { at: number; value: Provider[] } | null = null;

/** The environment-variable provider, used when nothing is configured in the panel. */
function envProvider(): Provider | null {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) return null;
  return {
    id: null,
    label: "Environment variables",
    apiKey,
    baseUrl: process.env.OPENAI_BASE_URL?.trim() || "",
    model: process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini",
    transcribeModel: process.env.OPENAI_TRANSCRIBE_MODEL?.trim() || "whisper-1",
  };
}

/** Enabled providers, best first. The env one is appended as a last resort. */
export async function loadProviders(force = false): Promise<Provider[]> {
  if (!force && cache && Date.now() - cache.at < CACHE_MS) return cache.value;

  const list: Provider[] = [];
  try {
    const { data, error } = await supabaseAdmin()
      .from("ai_providers")
      .select("id,label,api_key,base_url,model,transcribe_model,priority,created_at")
      .eq("enabled", true)
      .order("priority").order("created_at");
    if (error) throw new Error(error.message);

    for (const r of data ?? []) {
      if (!r.api_key?.trim()) continue;
      list.push({
        id: r.id as string,
        label: (r.label as string) || "Unnamed",
        apiKey: (r.api_key as string).trim(),
        baseUrl: ((r.base_url as string) || "").trim(),
        model: ((r.model as string) || "gpt-4o-mini").trim(),
        transcribeModel: ((r.transcribe_model as string) || "").trim(),
      });
    }
  } catch (err) {
    // Migration 010 may not have been run, or the database may be down. Either
    // way the environment variables still have to be able to carry the app.
    console.error("ai providers unavailable, using environment:", (err as Error)?.message);
  }

  const env = envProvider();
  if (env && !list.some((p) => p.apiKey === env.apiKey && p.baseUrl === env.baseUrl)) list.push(env);

  cache = { at: Date.now(), value: list };
  return list;
}

export function clearProviderCache() { cache = null; }

/** A client for one provider. Not cached: a key can change under us at any save. */
export function clientFor(p: Provider): OpenAI {
  const client = new OpenAI({ apiKey: p.apiKey, baseURL: p.baseUrl || undefined });
  if (p.baseUrl) patchForCompat(client);
  return client;
}

/* ------------------------------------------------------------------ */
/* Health                                                              */
/* ------------------------------------------------------------------ */

async function markOk(p: Provider) {
  if (!p.id) return;
  try { await supabaseAdmin().rpc("ai_provider_ok", { p_id: p.id }); } catch { /* bookkeeping */ }
}

async function markFailed(p: Provider, err: unknown) {
  if (!p.id) return;
  const message = (err as { message?: string })?.message ?? String(err);
  try { await supabaseAdmin().rpc("ai_provider_failed", { p_id: p.id, p_error: message }); } catch { /* bookkeeping */ }
}

/**
 * Is it worth trying the next key?
 *
 * A bad request is our fault and will fail identically everywhere, so failing
 * over would just burn a second key for the same error. Auth, quota, rate limit
 * and server trouble are the provider's problem, and the next key may well work.
 */
function worthRetrying(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (typeof status === "number") return status === 401 || status === 403 || status === 429 || status >= 500;
  return true;   // a network error has no status, and is exactly the retry case
}

export class NoProviderError extends Error {
  constructor() {
    super("No AI provider is configured. Add a key in the admin panel under AI keys, or set OPENAI_API_KEY.");
  }
}

/* ------------------------------------------------------------------ */
/* The calls                                                           */
/* ------------------------------------------------------------------ */

type CompletionParams = Record<string, unknown>;

/**
 * A chat completion, through the first provider that answers.
 *
 * The caller's `model` is ignored: the model belongs to whichever key ends up
 * being used, so a failover to a different provider still asks for a model that
 * provider actually has.
 */
export async function complete(params: CompletionParams): Promise<any> {
  const providers = await loadProviders();
  if (!providers.length) throw new NoProviderError();

  let lastError: unknown = null;

  for (const p of providers) {
    try {
      const client = clientFor(p);
      const res = await (client.chat.completions.create as any)({ ...params, model: p.model });
      void markOk(p);
      return res;
    } catch (err) {
      lastError = err;
      console.error(`AI provider "${p.label}" failed:`, (err as Error)?.message);
      void markFailed(p, err);
      if (!worthRetrying(err)) break;
    }
  }

  throw lastError ?? new NoProviderError();
}

/** The client and model for speech to text, from the first usable provider. */
export async function audioProvider(): Promise<{ client: OpenAI; model: string; provider: Provider }> {
  const providers = await loadProviders();
  if (!providers.length) throw new NoProviderError();
  const p = providers[0];
  return {
    client: clientFor(p),
    model: p.transcribeModel || process.env.OPENAI_TRANSCRIBE_MODEL || "whisper-1",
    provider: p,
  };
}

/** Try every provider for audio, in order. Used by the transcription fallback path. */
export async function eachProvider(): Promise<Provider[]> {
  return loadProviders();
}

export async function reportOk(p: Provider) { await markOk(p); }
export async function reportFailed(p: Provider, err: unknown) { await markFailed(p, err); }

/**
 * Check one key without saving it, for the "Test" button in the admin panel.
 * A tiny completion is the only honest check: listing models succeeds on keys
 * that have no quota left.
 */
export async function testProvider(p: Provider): Promise<{ ok: true; reply: string } | { ok: false; error: string }> {
  try {
    const client = clientFor(p);
    const res = await (client.chat.completions.create as any)({
      model: p.model,
      max_tokens: 5,
      messages: [{ role: "user", content: "Reply with the single word: ready" }],
    });
    const reply = res?.choices?.[0]?.message?.content?.trim() ?? "";
    return reply ? { ok: true, reply } : { ok: false, error: "The provider answered, but with nothing in it." };
  } catch (err) {
    return { ok: false, error: explain(err) };
  }
}

/** Turn a provider error into something an admin can act on. */
export function explain(err: unknown): string {
  const e = err as { status?: number; message?: string; code?: string };
  const message = e?.message ?? String(err);
  switch (e?.status) {
    case 401: return "The key was rejected. Check it is copied in full and has not been revoked.";
    case 403: return "The key is valid but not allowed to use this model. Check the model name and the account's access.";
    case 404: return `No model called "${message.match(/model[^\w]*([\w.:-]+)/i)?.[1] ?? "that"}" at this provider. Check the model name and the base URL.`;
    case 429: return "Out of quota or rate limited. Either the account has no credit left, or too many requests went out at once.";
    default:
      if (e?.status && e.status >= 500) return "The provider is having trouble at its end. Try again shortly.";
      if (/fetch failed|ENOTFOUND|ECONNREFUSED/i.test(message)) return "Could not reach the provider. Check the base URL.";
      return message.slice(0, 300);
  }
}

/* ------------------------------------------------------------------ */

/** Other providers differ on a few parameters, so adapt requests in ONE place. */
function patchForCompat(c: OpenAI) {
  const completions = c.chat.completions as any;
  const original = completions.create.bind(completions);
  const multiplier = Number(process.env.AI_TOKEN_MULTIPLIER || 3); // "thinking" models spend output tokens internally

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

/* ------------------------------------------------------------------ */
/* Helpers used across the routes                                      */
/* ------------------------------------------------------------------ */

/**
 * Kept so routes can carry on passing `model: MODEL`. complete() overrides it
 * with the model of whichever provider answers, so this is only a placeholder.
 */
export const MODEL = process.env.OPENAI_MODEL || "gpt-4o-mini";

/** Trim and cap user input. */
export function clean(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/** Pull a JSON object/array out of a model reply that may contain extra text. */
export function extractJson<T = any>(text: string, kind: "object" | "array"): T | null {
  const cleaned = text.replace(/```(?:json)?/gi, "");
  const m = cleaned.match(kind === "array" ? /\[[\s\S]*\]/ : /\{[\s\S]*\}/);
  if (!m) return null;
  try { return JSON.parse(m[0]) as T; } catch { return null; }
}

export async function readJson(req: Request): Promise<any> {
  try { return await req.json(); } catch { return {}; }
}
