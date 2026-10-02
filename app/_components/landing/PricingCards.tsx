import Link from "next/link";
import { Icon } from "../Icon";
import { UpgradeButton } from "../Upgrade";
import { RULES } from "../../../lib/plans";

const premiumTools = ["Flashcards", "Mock tests with scoring", "Interactive mind maps", "Slide builder with PowerPoint export", "Grammar fixer", "Paraphraser", "Citation maker"];

function Item({ children }: { children: React.ReactNode }) {
  return <li className="flex items-start gap-2.5 text-sm text-slate-300"><Icon name="check" size={16} className="mt-0.5 shrink-0 text-emerald-400" /><span>{children}</span></li>;
}

export function PricingCards() {
  const r = RULES;
  return (
    <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-2">
      <div className="glass rounded-3xl p-7">
        <h3 className="text-lg font-semibold text-white">Free</h3>
        <p className="mt-1 text-sm text-mute">Everything you need to try Eluna Mind.</p>
        <p className="mt-5 flex items-baseline gap-1"><span className="text-4xl font-bold text-white">$0</span><span className="text-mute">/ month</span></p>
        <ul className="mt-6 space-y-3">
          <Item>AI Tutor Chat: {r.chat.freePerDay} messages a day</Item>
          <Item>Smart Notes with history: {r.notes.freePerDay} a day</Item>
          <Item>Q&amp;A practice: {r.qna.freePerDay} a day</Item>
          <Item>Study planner: {r.studyPlan.freePerDay} a day</Item>
          <Item>Career guide: {r.career.freePerDay} a day</Item>
        </ul>
        <Link href="/login?mode=signup&next=/dashboard" className="btn btn-ghost mt-7 w-full">Start free</Link>
      </div>

      <div className="relative rounded-3xl p-px" style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee 55%,#f472b6)" }}>
        <div className="h-full rounded-[calc(1.5rem-1px)] bg-[#0b0b16] p-7">
          <span className="chip chip-brand absolute right-6 top-6">Most popular</span>
          <h3 className="text-lg font-semibold text-white">Premium</h3>
          <p className="mt-1 text-sm text-mute">All tools and much higher daily limits.</p>
          <p className="mt-5 flex items-baseline gap-1"><span className="gradient-text text-4xl font-bold">$15.99</span><span className="text-mute">/ month</span></p>
          <ul className="mt-6 space-y-3">
            <Item>Everything in Free, with up to {r.chat.premiumPerDay} chat messages and {r.notes.premiumPerDay} notes a day</Item>
            {premiumTools.map((t) => <Item key={t}>{t}</Item>)}
          </ul>
          <div className="mt-7"><UpgradeButton label="Get Premium" className="btn btn-primary w-full" /></div>
        </div>
      </div>
    </div>
  );
}
