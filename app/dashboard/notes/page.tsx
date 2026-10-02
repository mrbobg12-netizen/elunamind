"use client";
import { useCallback, useEffect, useState } from "react";
import { Icon } from "../../_components/Icon";
import { Markdown } from "../../_components/Markdown";
import { CopyButton, ErrorBox, Field, GenerateButton, Panel, Skeleton, ToolFrame, useToolRunner } from "../../_components/ToolUI";

type Item = { id: string; title: string; created_at: string };

export default function NotesPage() {
  const tool = useToolRunner<{ notes: string; id?: string }>("/api/generate");
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [history, setHistory] = useState<Item[]>([]);

  const loadHistory = useCallback(async () => {
    try { const r = await fetch("/api/notes"); if (r.ok) setHistory((await r.json()).notes ?? []); } catch { /* offline */ }
  }, []);

  const open = useCallback(async (id: string) => {
    const r = await fetch(`/api/notes/${id}`);
    if (!r.ok) return;
    const j = await r.json();
    setResult(j.note.content); setActiveId(id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  useEffect(() => {
    loadHistory();
    const id = new URLSearchParams(window.location.search).get("id");
    if (id) open(id);
  }, [loadHistory, open]);

  async function generate() {
    const j = await tool.run({ text });
    if (j) { setResult(j.notes); setActiveId(j.id ?? null); loadHistory(); }
  }
  async function remove(id: string) {
    await fetch(`/api/notes/${id}`, { method: "DELETE" });
    setHistory((h) => h.filter((x) => x.id !== id));
    if (activeId === id) { setResult(""); setActiveId(null); }
  }
  function download() {
    const blob = new Blob([result], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = "notes.txt"; a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <ToolFrame toolKey="notes" wide>
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
        <div className="min-w-0 space-y-5">
          <Panel>
            <Field label="Paste your text or describe a topic" hint={`${text.length}/8000`}>
              <textarea className="input" rows={6} maxLength={8000} value={text} onChange={(e) => setText(e.target.value)} placeholder="e.g. Paste a lecture, a chapter, or write: 'The causes of World War 1'" />
            </Field>
            <div className="mt-4"><GenerateButton loading={tool.loading} disabled={!text.trim()} onClick={generate} label="Generate notes" /></div>
          </Panel>
          <ErrorBox error={tool.error} upgrade={tool.upgrade} />
          {tool.loading && <Panel><Skeleton lines={8} /></Panel>}
          {!tool.loading && result && (
            <Panel className="pop-in">
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <span className="chip chip-ok"><Icon name="check" size={12} /> Saved to history</span>
                <div className="flex gap-2"><CopyButton text={result} /><button type="button" className="btn btn-ghost btn-sm" onClick={download}><Icon name="download" size={14} /> .txt</button></div>
              </div>
              <Markdown text={result} />
            </Panel>
          )}
        </div>

        <aside>
          <Panel className="!p-4">
            <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white"><Icon name="history" size={16} className="text-cyan-300" /> Notes history</h2>
            {history.length === 0 ? <p className="py-3 text-sm text-mute">Generated notes are saved here automatically.</p> : (
              <ul className="space-y-0.5">
                {history.map((n) => (
                  <li key={n.id} className={`group flex items-center rounded-lg pr-1 ${activeId === n.id ? "bg-white/10" : "hover:bg-white/5"}`}>
                    <button type="button" onClick={() => open(n.id)} className="min-w-0 flex-1 px-2.5 py-2 text-left">
                      <span className="block truncate text-sm text-slate-200">{n.title}</span>
                      <span className="text-[0.68rem] text-mute">{new Date(n.created_at).toLocaleDateString()}</span>
                    </button>
                    <button type="button" aria-label="Delete note" onClick={() => remove(n.id)} className="rounded-md p-1.5 text-mute opacity-0 transition hover:bg-red-500/20 hover:text-red-300 group-hover:opacity-100"><Icon name="trash" size={14} /></button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </aside>
      </div>
    </ToolFrame>
  );
}
