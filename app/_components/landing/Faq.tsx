"use client";
import { useState } from "react";
import { Icon } from "../Icon";

const ITEMS = [
  ["Is Eluna Mind really free to start?", "Yes. Create an account and use the AI tutor chat, smart notes, Q&A practice, study planner and career guide on the free plan. No card is needed."],
  ["What happens when I reach my daily limit?", "You will see how many uses are left on every tool. When a limit is reached it resets the next day, or you can upgrade to Premium for much higher limits."],
  ["Can I ask questions in Urdu or Roman Urdu?", "Yes. The tutor replies in the language you write in, including English, Urdu and Roman Urdu."],
  ["Are my notes and chats saved?", "Yes. Your chats and generated notes are stored in your account so you can reopen them later, and you can delete them whenever you like."],
  ["Is the AI always correct?", "No. AI can make mistakes, especially with facts, numbers and citations. Treat answers as a study aid and double-check anything important."],
  ["How do I upgrade or cancel?", "Upgrade from the dashboard or pricing page. To cancel or ask about billing, email support@elunamind.app."],
] as const;

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-3xl space-y-3">
      {ITEMS.map(([q, a], i) => (
        <div key={q} className="glass overflow-hidden rounded-2xl">
          <button type="button" onClick={() => setOpen(open === i ? null : i)} className="flex w-full items-center gap-3 p-5 text-left" aria-expanded={open === i}>
            <span className="flex-1 font-medium text-white">{q}</span>
            <Icon name="chevron" size={18} className={`shrink-0 text-mute transition-transform duration-300 ${open === i ? "rotate-90" : ""}`} />
          </button>
          <div className="grid transition-all duration-300" style={{ gridTemplateRows: open === i ? "1fr" : "0fr" }}>
            <div className="overflow-hidden"><p className="px-5 pb-5 text-sm leading-relaxed text-mute">{a}</p></div>
          </div>
        </div>
      ))}
    </div>
  );
}
