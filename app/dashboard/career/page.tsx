"use client";
import { useState } from "react";
import { Markdown } from "../../_components/Markdown";
import { CopyButton, ErrorBox, Field, GenerateButton, Panel, Skeleton, ToolFrame, useToolRunner } from "../../_components/ToolUI";

type Block = { title: string; body: string };
type Mode = "opt1" | "opt2" | "opt3";

const PATH_Q: { q: string; options: string[] }[] = [
  { q: "What do you enjoy most?", options: ["Solving problems", "Creating things", "Helping people", "Leading & organizing", "Working with data"] },
  { q: "How do you like to work?", options: ["Mostly alone", "In a small team", "With lots of people"] },
  { q: "What matters most to you?", options: ["High salary", "Job stability", "Creativity", "Making an impact", "Flexibility"] },
  { q: "Preferred environment?", options: ["Office", "Remote", "Outdoors / field", "A mix"] },
  { q: "Your education level?", options: ["School", "College / University", "Graduate"] },
];
const INCOME_Q: { q: string; options: string[] }[] = [
  { q: "Hours per week you can spare?", options: ["5", "10", "20", "30+"] },
  { q: "Starting budget?", options: ["None", "Under $50", "Under $200", "$200+"] },
  { q: "Where do you prefer to work?", options: ["Online", "Offline", "Both"] },
];

export default function CareerPage() {
  const tool = useToolRunner<{ blocks: Block[] }>("/api/career");
  const [mode, setMode] = useState<Mode>("opt1");
  const [role, setRole] = useState("");
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [skills, setSkills] = useState("");
  const [blocks, setBlocks] = useState<Block[]>([]);

  const questions = mode === "opt2" ? PATH_Q : INCOME_Q;
  const ready = mode === "opt1" ? role.trim().length > 1 : questions.every((x) => answers[x.q]) && (mode === "opt2" || skills.trim().length > 1);

  async function generate() {
    const payload = mode === "opt1" ? { mode, role } : { mode, answers: mode === "opt3" ? { ...answers, "Skills you have": skills } : answers };
    const j = await tool.run(payload);
    if (j) setBlocks(j.blocks);
  }
  const tabs: { id: Mode; label: string }[] = [{ id: "opt1", label: "Career roadmap" }, { id: "opt2", label: "Find my path" }, { id: "opt3", label: "Side income" }];

  return (
    <ToolFrame toolKey="career">
      <div className="space-y-5">
        <Panel>
          <div className="mb-5 flex gap-1 rounded-xl bg-white/5 p-1">
            {tabs.map((t) => (
              <button key={t.id} type="button" onClick={() => { setMode(t.id); setBlocks([]); }} className={`flex-1 rounded-lg px-2 py-2 text-sm font-medium transition ${mode === t.id ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-paper shadow" : "text-muted hover:text-paper"}`}>{t.label}</button>
            ))}
          </div>
          {mode === "opt1" ? (
            <Field label="Which career do you want?"><input className="input" maxLength={120} value={role} onChange={(e) => setRole(e.target.value)} placeholder="e.g. Data Scientist, Pilot, Graphic Designer" /></Field>
          ) : (
            <div className="space-y-5">
              {mode === "opt3" && <Field label="Skills you already have"><input className="input" maxLength={200} value={skills} onChange={(e) => setSkills(e.target.value)} placeholder="e.g. writing, Photoshop, tutoring" /></Field>}
              {questions.map((x) => (
                <div key={x.q}>
                  <p className="mb-2 text-sm font-medium text-paper/85">{x.q}</p>
                  <div className="flex flex-wrap gap-2">
                    {x.options.map((o) => (
                      <button key={o} type="button" onClick={() => setAnswers((a) => ({ ...a, [x.q]: o }))} className={`rounded-full border px-3.5 py-1.5 text-sm transition ${answers[x.q] === o ? "border-amber-400/60 bg-amber-400/15 text-paper" : "border-white/10 bg-white/5 text-paper/75 hover:border-white/25"}`}>{o}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-5"><GenerateButton loading={tool.loading} disabled={!ready} onClick={generate} label="Get my guidance" /></div>
        </Panel>
        <ErrorBox error={tool.error} upgrade={tool.upgrade} />
        {tool.loading && <Panel><Skeleton lines={8} /></Panel>}
        {!tool.loading && blocks.length > 0 && (
          <div className="space-y-3">
            <div className="flex justify-end"><CopyButton text={blocks.map((b) => `${b.title}\n${b.body}`).join("\n\n")} label="Copy all" /></div>
            {blocks.map((b, i) => (
              <Panel key={i} className="pop-in" ><h3 className="mb-1 text-base font-semibold text-lamp">{b.title}</h3><Markdown text={b.body} /></Panel>
            ))}
          </div>
        )}
      </div>
    </ToolFrame>
  );
}
