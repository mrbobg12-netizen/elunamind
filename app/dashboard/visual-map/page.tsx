"use client";
import { useMemo, useState } from "react";
import { ErrorBox, Field, GenerateButton, Panel, Skeleton, ToolFrame, useToolRunner } from "../../_components/ToolUI";

type N = { id: string | number; label: string; details?: string };
type E = { from: string | number; to: string | number };

const W = 190, H = 48, GX = 80, GY = 22, PAD = 24;
const COLORS = ["#8b5cf6", "#6366f1", "#0ea5e9", "#14b8a6", "#f59e0b", "#ec4899"];

function layout(nodes: N[], edges: E[]) {
  const ids = nodes.map((n) => String(n.id));
  const adj = new Map<string, string[]>();
  edges.forEach((e) => { const a = String(e.from); if (!adj.has(a)) adj.set(a, []); adj.get(a)!.push(String(e.to)); });
  const level = new Map<string, number>();
  if (ids.length) {
    level.set(ids[0], 0);
    const q = [ids[0]];
    while (q.length) {
      const c = q.shift()!;
      for (const nx of adj.get(c) ?? []) if (!level.has(nx) && ids.includes(nx)) { level.set(nx, level.get(c)! + 1); q.push(nx); }
    }
  }
  const maxL = Math.max(0, ...level.values());
  ids.forEach((id) => { if (!level.has(id)) level.set(id, maxL + 1); });
  const cols: string[][] = [];
  ids.forEach((id) => { const l = level.get(id)!; (cols[l] ||= []).push(id); });
  const tallest = Math.max(1, ...cols.map((c) => (c ? c.length : 0)));
  const colH = tallest * (H + GY) - GY;
  const pos = new Map<string, { x: number; y: number; l: number }>();
  cols.forEach((col, l) => {
    if (!col) return;
    const h = col.length * (H + GY) - GY;
    col.forEach((id, r) => pos.set(id, { x: PAD + l * (W + GX), y: PAD + (colH - h) / 2 + r * (H + GY), l }));
  });
  return { pos, width: PAD * 2 + cols.length * (W + GX) - GX, height: PAD * 2 + colH };
}

export default function VisualMapPage() {
  const tool = useToolRunner<{ nodes: N[]; edges: E[] }>("/api/generate-visual-map");
  const [topic, setTopic] = useState("");
  const [map, setMap] = useState<{ nodes: N[]; edges: E[] } | null>(null);
  const [sel, setSel] = useState<string | null>(null);

  async function generate() {
    const j = await tool.run({ topic });
    if (j) { setMap({ nodes: j.nodes, edges: j.edges }); setSel(j.nodes[0] ? String(j.nodes[0].id) : null); }
  }
  const lay = useMemo(() => (map ? layout(map.nodes, map.edges) : null), [map]);
  const selected = map?.nodes.find((n) => String(n.id) === sel);

  return (
    <ToolFrame toolKey="visualMap" wide>
      <div className="space-y-5">
        <Panel>
          <Field label="Topic" hint={`${topic.length}/300`}><input className="input" maxLength={300} value={topic} onChange={(e) => setTopic(e.target.value)} onKeyDown={(e) => e.key === "Enter" && topic.trim() && generate()} placeholder="e.g. Climate change" /></Field>
          <div className="mt-4"><GenerateButton loading={tool.loading} disabled={!topic.trim()} onClick={generate} label="Build mind map" /></div>
        </Panel>
        <ErrorBox error={tool.error} upgrade={tool.upgrade} />
        {tool.loading && <Panel><Skeleton lines={7} /></Panel>}
        {!tool.loading && map && lay && (
          <div className="pop-in space-y-4">
            <div className="glass overflow-auto rounded-2xl p-2">
              <svg width={lay.width} height={lay.height} viewBox={`0 0 ${lay.width} ${lay.height}`} role="img" aria-label="Mind map" className="mx-auto block max-w-none">
                {map.edges.map((e, i) => {
                  const a = lay.pos.get(String(e.from)), b = lay.pos.get(String(e.to));
                  if (!a || !b) return null;
                  const x1 = a.x + W, y1 = a.y + H / 2, x2 = b.x, y2 = b.y + H / 2, dx = Math.max(40, Math.abs(x2 - x1) / 2);
                  return <path key={i} d={`M${x1} ${y1} C${x1 + dx} ${y1}, ${x2 - dx} ${y2}, ${x2} ${y2}`} fill="none" stroke="rgba(167,139,250,.5)" strokeWidth="1.6" />;
                })}
                {map.nodes.map((n) => {
                  const p = lay.pos.get(String(n.id)); if (!p) return null;
                  const active = sel === String(n.id); const c = COLORS[p.l % COLORS.length];
                  const label = n.label.length > 24 ? n.label.slice(0, 23) + "…" : n.label;
                  return (
                    <g key={String(n.id)} onClick={() => setSel(String(n.id))} className="cursor-pointer" role="button" tabIndex={0} onKeyDown={(e) => e.key === "Enter" && setSel(String(n.id))}>
                      <title>{n.label}</title>
                      <rect x={p.x} y={p.y} width={W} height={H} rx="14" fill={c} fillOpacity={active ? 0.95 : 0.3} stroke={c} strokeWidth={active ? 2.5 : 1.2} style={{ transition: "all .2s" }} />
                      <text x={p.x + W / 2} y={p.y + H / 2} textAnchor="middle" dominantBaseline="central" fontSize="13" fontWeight="600" fill="#fff">{label}</text>
                    </g>
                  );
                })}
              </svg>
            </div>
            {selected && (
              <Panel className="pop-in" ><h3 className="mb-1 font-semibold text-lamp">{selected.label}</h3><p className="text-sm leading-relaxed text-paper/75">{selected.details || "No details provided."}</p></Panel>
            )}
            <p className="text-center text-xs text-muted">Click any node to read its explanation. Scroll sideways on small screens.</p>
          </div>
        )}
      </div>
    </ToolFrame>
  );
}
