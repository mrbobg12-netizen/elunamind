import React from "react";

// Small, dependency-free markdown renderer (headings, lists, bold, inline/fenced code). No raw HTML is ever injected.
function inline(text: string, k: string): React.ReactNode[] {
  return text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g).map((p, i) => {
    if (p.length > 4 && p.startsWith("**") && p.endsWith("**"))
      return <strong key={k + i} className="font-semibold text-white">{p.slice(2, -2)}</strong>;
    if (p.length > 2 && p.startsWith("`") && p.endsWith("`"))
      return <code key={k + i} className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-[0.85em] text-cyan-200">{p.slice(1, -1)}</code>;
    return <React.Fragment key={k + i}>{p}</React.Fragment>;
  });
}

const isBullet = (l: string) => /^\s*[-*•]\s+/.test(l);
const isNum = (l: string) => /^\s*\d+[.)]\s+/.test(l);
const isHead = (l: string) => /^#{1,4}\s/.test(l);
const isFence = (l: string) => l.trim().startsWith("```");

export function Markdown({ text, className = "" }: { text: string; className?: string }) {
  const lines = text.replace(/\r/g, "").split("\n");
  const out: React.ReactNode[] = [];
  let i = 0, key = 0;

  while (i < lines.length) {
    const line = lines[i];
    if (isFence(line)) {
      const buf: string[] = [];
      i++;
      while (i < lines.length && !isFence(lines[i])) buf.push(lines[i++]);
      i++;
      out.push(<pre key={key++} className="my-3 overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-[0.85rem] leading-relaxed text-cyan-100"><code>{buf.join("\n")}</code></pre>);
    } else if (isHead(line)) {
      const level = line.match(/^#+/)![0].length;
      const content = line.replace(/^#+\s*/, "");
      const cls = level <= 1 ? "mt-5 mb-2 text-xl font-bold text-white" : level === 2 ? "mt-5 mb-2 text-lg font-bold text-white" : "mt-4 mb-1.5 text-base font-semibold text-violet-200";
      out.push(<div key={key++} className={cls}>{inline(content, `h${key}`)}</div>);
      i++;
    } else if (isBullet(line)) {
      const items: string[] = [];
      while (i < lines.length && isBullet(lines[i])) items.push(lines[i++].replace(/^\s*[-*•]\s+/, ""));
      out.push(<ul key={key++} className="my-2 list-disc space-y-1.5 pl-5 marker:text-violet-400">{items.map((t, j) => <li key={j}>{inline(t, `b${key}${j}`)}</li>)}</ul>);
    } else if (isNum(line)) {
      const items: string[] = [];
      while (i < lines.length && isNum(lines[i])) items.push(lines[i++].replace(/^\s*\d+[.)]\s+/, ""));
      out.push(<ol key={key++} className="my-2 list-decimal space-y-1.5 pl-5 marker:text-cyan-400">{items.map((t, j) => <li key={j}>{inline(t, `n${key}${j}`)}</li>)}</ol>);
    } else if (/^\s*(-{3,}|_{3,}|\*{3,})\s*$/.test(line)) {
      out.push(<hr key={key++} className="my-4 border-white/10" />);
      i++;
    } else if (line.trim() === "") {
      i++;
    } else {
      const buf: string[] = [];
      while (i < lines.length && lines[i].trim() !== "" && !isFence(lines[i]) && !isHead(lines[i]) && !isBullet(lines[i]) && !isNum(lines[i])) buf.push(lines[i++]);
      out.push(
        <p key={key++} className="my-2">
          {buf.map((t, j) => <React.Fragment key={j}>{j > 0 && <br />}{inline(t, `p${key}${j}`)}</React.Fragment>)}
        </p>
      );
    }
  }
  return <div className={`leading-relaxed text-[0.95rem] text-slate-200 ${className}`}>{out}</div>;
}
