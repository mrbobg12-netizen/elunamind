"use client";
import { useEffect, useRef, useState } from "react";
import { Icon } from "../Icon";

/**
 * The hero's moving picture: a looping, self-contained product demo.
 * Three scenes play in sequence — ask, notes, revise — then it starts over.
 * Pure DOM/SVG so there is no video file to load and nothing to buffer.
 */
const ASK = "Explain photosynthesis like I'm 12";
const SCENES = [
  { id: 0, label: "Ask", ms: 6200 },
  { id: 1, label: "Notes", ms: 5200 },
  { id: 2, label: "Revise", ms: 5200 },
];

export function DemoLoop() {
  const [scene, setScene] = useState(0);
  const [typed, setTyped] = useState("");
  const [flipped, setFlipped] = useState(false);
  const [paused, setPaused] = useState(false);
  const box = useRef<HTMLDivElement>(null);

  // pause while off-screen so the loop never runs in a background tab
  useEffect(() => {
    const el = box.current;
    if (!el || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([e]) => setPaused(!e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (paused) return;
    const t = setTimeout(() => setScene((s) => (s + 1) % SCENES.length), SCENES[scene].ms);
    return () => clearTimeout(t);
  }, [scene, paused]);

  // scene 0: type the question one character at a time
  useEffect(() => {
    if (scene !== 0 || paused) return;
    setTyped("");
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setTyped(ASK.slice(0, i));
      if (i >= ASK.length) clearInterval(id);
    }, 45);
    return () => clearInterval(id);
  }, [scene, paused]);

  // scene 2: flip the card halfway through
  useEffect(() => {
    if (scene !== 2 || paused) { setFlipped(false); return; }
    setFlipped(false);
    const t = setTimeout(() => setFlipped(true), 2400);
    return () => clearTimeout(t);
  }, [scene, paused]);

  const answered = typed.length >= ASK.length;

  return (
    <div ref={box} className="relative">
      <div className="lamp-glow -right-16 -top-20 h-64 w-64 bg-amber-400/25" style={{ animation: "lamp-pulse 7s ease-in-out infinite" }} />

      <div className="glass-strong relative overflow-hidden rounded-[1.6rem]">
        {/* window chrome */}
        <div className="flex items-center gap-3 border-b border-white/10 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="h-2.5 w-2.5 rounded-full bg-white/20" />
          <span className="ml-1 text-xs text-muted">elunamind.app</span>
          <span className="ml-auto flex gap-1.5" aria-hidden="true">
            {SCENES.map((s) => (
              <span key={s.id} className="h-1 rounded-full transition-all duration-500" style={{ width: scene === s.id ? 22 : 8, background: scene === s.id ? "var(--lamp)" : "rgba(255,255,255,.2)" }} />
            ))}
          </span>
        </div>

        <div className="relative h-[310px] sm:h-[340px]">
          {/* ---- scene 1: ask ---- */}
          <div className={`absolute inset-0 p-5 transition-opacity duration-500 ${scene === 0 ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="flex justify-end">
              <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#1b2440] px-4 py-2.5 text-sm text-paper">
                {typed}<span className="caret" />
              </p>
            </div>
            {answered && (
              <div className="pop-in mt-4 flex gap-2.5">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-lamp text-[#231704]"><Icon name="spark" size={14} /></span>
                <div className="rounded-2xl rounded-tl-sm bg-white/[0.06] px-4 py-3 text-sm leading-relaxed text-paper/90">
                  A leaf is a tiny kitchen. Sunlight is the heat, water and air are the ingredients, and chlorophyll is the chef.
                  <span className="mt-2 block text-muted">It cooks sugar for the plant and breathes out the oxygen we use.</span>
                </div>
              </div>
            )}
          </div>

          {/* ---- scene 2: notes being written ---- */}
          <div className={`absolute inset-0 p-5 transition-opacity duration-500 ${scene === 1 ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <p className="mb-3 text-xs text-muted">Smart Notes</p>
            {scene === 1 && (
              <div className="space-y-3">
                <p className="type-line font-display text-lg text-paper" style={{ animationDelay: "0ms", maxWidth: "19ch" }}>Photosynthesis</p>
                {["Inputs: sunlight, water, CO₂", "Where: chloroplasts in the leaf", "Outputs: glucose and oxygen", "Exam tip: label the leaf diagram"].map((t, i) => (
                  <div key={t} className="pop-in flex items-start gap-2.5 text-sm text-paper/85" style={{ animationDelay: `${900 + i * 520}ms` }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" className="mt-1 shrink-0" aria-hidden="true">
                      <path className="draw-line" d="M5 13l4 4L19 7" fill="none" stroke="var(--lamp)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" style={{ animationDelay: `${900 + i * 520}ms` }} />
                    </svg>
                    {t}
                  </div>
                ))}
                <p className="pop-in text-xs text-mint" style={{ animationDelay: "3100ms" }}>Saved to your notes</p>
              </div>
            )}
          </div>

          {/* ---- scene 3: flashcard revision ---- */}
          <div className={`absolute inset-0 grid place-items-center p-5 transition-opacity duration-500 ${scene === 2 ? "opacity-100" : "pointer-events-none opacity-0"}`}>
            <div className="flip-scene w-full max-w-sm">
              <div className={`flip-card h-40 ${flipped ? "flipped" : ""}`}>
                <div className="flip-face grid place-items-center rounded-2xl border border-white/12 bg-white/[0.05] p-6 text-center">
                  <p className="font-display text-xl text-paper">Which gas do plants release?</p>
                </div>
                <div className="flip-face flip-back grid place-items-center rounded-2xl border p-6 text-center" style={{ borderColor: "rgba(110,231,199,.35)", background: "rgba(110,231,199,.1)" }}>
                  <p className="font-display text-2xl text-mint">Oxygen</p>
                </div>
              </div>
            </div>
            <p className="mt-4 text-xs text-muted">Card 3 of 5 · tap to flip</p>
          </div>
        </div>

        {/* scene captions */}
        <div className="flex border-t border-white/10 text-xs">
          {SCENES.map((s) => (
            <button key={s.id} type="button" onClick={() => setScene(s.id)}
              className={`flex-1 py-3 transition-colors ${scene === s.id ? "text-paper" : "text-muted hover:text-paper/80"}`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
