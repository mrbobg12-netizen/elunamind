"use client";
import { useState } from "react";
import { Icon } from "../Icon";

const ITEMS = [
  ["Is it really free to start?", "Yes. Create an account and use the tutor chat, smart notes, Q&A practice, study planner and career guide without paying. No card is needed."],
  ["What happens when I hit a daily limit?", "Every tool shows what you have left before you use it. Limits reset the next day, or Premium raises them well above everyday use."],
  ["Can I ask in Urdu or Roman Urdu?", "Yes. The tutor answers in whatever language you write in, including English, Urdu and Roman Urdu."],
  ["Are my chats and notes kept?", "Chats and generated notes are saved to your account so you can reopen them later. You can delete any of them whenever you want."],
  ["Is the AI always right?", "No. AI gets facts, numbers and citations wrong sometimes. Use it to understand faster, then check anything that matters."],
  ["How do I cancel?", "Email us and your subscription stops at the end of the billing period. Your free plan stays."],
] as const;

export function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <div className="mx-auto max-w-2xl">
      {ITEMS.map(([q, a], i) => {
        const isOpen = open === i;
        return (
          <div key={q} className="border-b border-white/10">
            <button type="button" onClick={() => setOpen(isOpen ? null : i)} aria-expanded={isOpen}
              className="flex w-full items-center gap-4 py-5 text-left">
              <span className={`flex-1 font-display text-lg transition-colors ${isOpen ? "text-lamp" : "text-paper"}`}>{q}</span>
              <Icon name="chevron" size={17} className={`shrink-0 text-muted transition-transform duration-300 ${isOpen ? "rotate-90" : ""}`} />
            </button>
            <div className="grid transition-all duration-300" style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}>
              <div className="overflow-hidden"><p className="lede pb-5 pr-8 text-sm">{a}</p></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
