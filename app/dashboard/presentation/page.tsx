"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { Icon } from "../../_components/Icon";
import { CopyButton, ErrorBox, Field, GenerateButton, Panel, Skeleton, ToolFrame, useToolRunner } from "../../_components/ToolUI";

type Slide = { title: string; bullets: string[]; notes: string };

function loadPptx(): Promise<any> {
  return new Promise((resolve, reject) => {
    const w = window as any;
    if (w.PptxGenJS) return resolve(w.PptxGenJS);
    const s = document.createElement("script");
    s.src = "https://cdnjs.cloudflare.com/ajax/libs/pptxgenjs/3.12.0/pptxgen.min.js";
    s.onload = () => (w.PptxGenJS ? resolve(w.PptxGenJS) : reject(new Error("Exporter unavailable")));
    s.onerror = () => reject(new Error("Could not load the PowerPoint exporter. Check your connection."));
    document.head.appendChild(s);
  });
}

export default function PresentationPage() {
  const tool = useToolRunner<{ slides: Slide[] }>("/api/generate-presentation");
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(10);
  const [slides, setSlides] = useState<Slide[]>([]);
  const [i, setI] = useState(0);
  const [edit, setEdit] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [exportErr, setExportErr] = useState("");
  const stage = useRef<HTMLDivElement>(null);

  async function generate() {
    const j = await tool.run({ topic, slides: count });
    if (j) { setSlides(j.slides); setI(0); setEdit(false); }
  }
  const go = useCallback((d: number) => setI((x) => Math.min(Math.max(x + d, 0), Math.max(slides.length - 1, 0))), [slides.length]);
  useEffect(() => {
    if (!slides.length) return;
    const h = (e: KeyboardEvent) => {
      const t = (e.target as HTMLElement)?.tagName;
      if (t === "INPUT" || t === "TEXTAREA") return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [slides.length, go]);

  const cur = slides[i];
  const upd = (p: Partial<Slide>) => setSlides((s) => s.map((x, k) => (k === i ? { ...x, ...p } : x)));

  async function exportPptx() {
    setExporting(true); setExportErr("");
    try {
      const P = await loadPptx();
      const pptx = new P();
      pptx.layout = "LAYOUT_WIDE";
      slides.forEach((s, idx) => {
        const sl = pptx.addSlide();
        sl.background = { color: "0B0B14" };
        if (idx === 0) {
          sl.addText(s.title, { x: 0.8, y: 2.2, w: 11.7, h: 1.4, fontSize: 44, bold: true, color: "FFFFFF" });
          if (s.bullets.length) sl.addText(s.bullets.join("   •   "), { x: 0.8, y: 3.7, w: 11.7, h: 1, fontSize: 20, color: "A5B4FC" });
        } else {
          sl.addText(s.title, { x: 0.7, y: 0.4, w: 11.9, h: 1, fontSize: 32, bold: true, color: "FFFFFF" });
          sl.addText(s.bullets.map((b) => ({ text: b, options: { bullet: true, breakLine: true } })), { x: 0.9, y: 1.6, w: 11.5, h: 4.8, fontSize: 22, color: "E5E7EB", paraSpaceAfter: 10 });
        }
        if (s.notes) sl.addNotes(s.notes);
      });
      await pptx.writeFile({ fileName: `${(topic || "presentation").replace(/[^\w\- ]+/g, "").slice(0, 50) || "presentation"}.pptx` });
    } catch (e) { setExportErr((e as Error).message || "Export failed."); }
    finally { setExporting(false); }
  }

  return (
    <ToolFrame toolKey="presentation" wide>
      <div className="space-y-5">
        <Panel>
          <div className="grid gap-4 sm:grid-cols-[1fr_200px]">
            <Field label="Presentation topic" hint={`${topic.length}/300`}><input className="input" maxLength={300} value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && topic.trim() && generate()} placeholder="e.g. Renewable energy sources" /></Field>
            <Field label={`Slides: ${count}`}><input type="range" min={5} max={12} value={count} onChange={(e) => setCount(+e.target.value)} className="mt-3 w-full accent-pink-500" /></Field>
          </div>
          <div className="mt-4"><GenerateButton loading={tool.loading} disabled={!topic.trim()} onClick={generate} label="Generate slides" /></div>
        </Panel>
        <ErrorBox error={tool.error} upgrade={tool.upgrade} />
        {tool.loading && <Panel><Skeleton lines={7} /></Panel>}

        {!tool.loading && cur && (
          <div className="pop-in space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="text-sm text-mute">Slide {i + 1} of {slides.length}</span>
              <div className="flex flex-wrap gap-2">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEdit((v) => !v)}><Icon name="edit" size={14} /> {edit ? "Done editing" : "Edit slide"}</button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => stage.current?.requestFullscreen?.()}><Icon name="expand" size={14} /> Fullscreen</button>
                <CopyButton label="Copy text" text={slides.map((s, k) => `Slide ${k + 1}: ${s.title}\n${s.bullets.map((b) => `• ${b}`).join("\n")}`).join("\n\n")} />
                <button type="button" className="btn btn-primary btn-sm" onClick={exportPptx} disabled={exporting}>{exporting ? <><span className="spinner" /> Exporting…</> : <><Icon name="download" size={14} /> PowerPoint</>}</button>
              </div>
            </div>
            {exportErr && <ErrorBox error={exportErr} />}

            <div ref={stage} className="relative aspect-video w-full overflow-hidden rounded-3xl border border-white/10 p-[5%]" style={{ background: "radial-gradient(circle at 15% 10%, #2a1a5e, #0b0b14 60%)" }}>
              <div className="orb -right-10 -top-10 h-40 w-40 bg-cyan-500/30" />
              {edit ? (
                <div className="relative h-full space-y-3 overflow-y-auto">
                  <input className="input !text-lg font-bold" value={cur.title} onChange={(e) => upd({ title: e.target.value })} />
                  <textarea className="input" rows={6} value={cur.bullets.join("\n")} onChange={(e) => upd({ bullets: e.target.value.split("\n") })} placeholder="One bullet per line" />
                </div>
              ) : (
                <div key={i} className="page-enter relative flex h-full flex-col justify-center">
                  <h2 className={`font-bold leading-tight text-white ${i === 0 ? "text-[clamp(1.4rem,4.5vw,3rem)]" : "mb-[3%] text-[clamp(1.1rem,3vw,2.2rem)]"}`}>{cur.title}</h2>
                  <ul className={`space-y-[1.2%] ${i === 0 ? "mt-3 text-[clamp(.8rem,1.8vw,1.3rem)] text-indigo-200" : "list-disc pl-[4%] text-[clamp(.8rem,2vw,1.4rem)] text-slate-200 marker:text-violet-400"}`}>
                    {cur.bullets.filter(Boolean).map((b, k) => <li key={k} className={i === 0 ? "list-none" : ""}>{b}</li>)}
                  </ul>
                </div>
              )}
            </div>

            {cur.notes && <Panel className="!p-4"><p className="mb-1 text-xs font-semibold uppercase tracking-wider text-mute">Speaker notes</p><p className="text-sm leading-relaxed text-slate-300">{cur.notes}</p></Panel>}

            <div className="flex items-center justify-between gap-3">
              <button type="button" className="btn btn-ghost" onClick={() => go(-1)} disabled={i === 0}><span className="rotate-180"><Icon name="chevron" size={16} /></span> Prev</button>
              <div className="flex max-w-[50%] gap-1.5 overflow-x-auto py-1">
                {slides.map((_, k) => <button key={k} type="button" aria-label={`Slide ${k + 1}`} onClick={() => setI(k)} className={`h-2 shrink-0 rounded-full transition-all ${k === i ? "w-6 bg-violet-400" : "w-2 bg-white/20 hover:bg-white/40"}`} />)}
              </div>
              <button type="button" className="btn btn-primary" onClick={() => go(1)} disabled={i === slides.length - 1}>Next <Icon name="chevron" size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </ToolFrame>
  );
}
