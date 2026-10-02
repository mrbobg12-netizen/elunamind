import Link from "next/link";
import { Icon } from "../Icon";
import { UpgradeButton } from "../Upgrade";
import { RULES } from "../../../lib/plans";

const premiumTools = ["Flashcards", "Mock tests with scoring", "Interactive mind maps", "Slide builder with PowerPoint export", "Grammar fixer", "Paraphraser", "Citation maker"];

function Row({ children, lit = false }: { children: React.ReactNode; lit?: boolean }) {
  return (
    <li className="flex items-start gap-2.5 text-sm leading-relaxed text-paper/80">
      <Icon name="check" size={15} className={`mt-1 shrink-0 ${lit ? "text-lamp" : "text-mint"}`} />
      <span>{children}</span>
    </li>
  );
}

export function PricingCards() {
  const r = RULES;
  return (
    <div className="mx-auto grid max-w-4xl items-start gap-5 md:grid-cols-2">
      <div className="glass rounded-2xl p-7">
        <h3 className="font-display text-xl text-paper">Free</h3>
        <p className="mt-1 text-sm text-muted">Enough to study with every day.</p>
        <p className="mt-6 font-display text-4xl text-paper">$0</p>
        <p className="text-sm text-muted">forever</p>
        <ul className="mt-7 space-y-3">
          <Row>Tutor chat, {r.chat.freePerDay} messages a day</Row>
          <Row>Smart notes with history, {r.notes.freePerDay} a day</Row>
          <Row>Q&amp;A practice, {r.qna.freePerDay} a day</Row>
          <Row>Study planner, {r.studyPlan.freePerDay} a day</Row>
          <Row>Career guide, {r.career.freePerDay} a day</Row>
        </ul>
        <Link href="/login?mode=signup&next=/dashboard" className="btn btn-ghost mt-8 w-full">Create free account</Link>
      </div>

      <div className="glass-strong relative rounded-2xl p-7" style={{ borderColor: "rgba(245,181,68,.35)" }}>
        <div className="lamp-glow -right-10 -top-10 h-40 w-40 bg-amber-400/20" />
        <div className="relative">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-paper">Premium</h3>
            <span className="chip chip-brand">Everything unlocked</span>
          </div>
          <p className="mt-1 text-sm text-muted">For exam weeks and heavy study days.</p>
          <p className="mt-6 font-display text-4xl text-lamp">$15.99</p>
          <p className="text-sm text-muted">per month, cancel any time</p>
          <ul className="mt-7 space-y-3">
            <Row lit>Up to {r.chat.premiumPerDay} chat messages and {r.notes.premiumPerDay} notes a day</Row>
            {premiumTools.map((t) => <Row key={t} lit>{t}</Row>)}
          </ul>
          <div className="mt-8"><UpgradeButton label="Get Premium" className="btn btn-primary w-full" /></div>
        </div>
      </div>
    </div>
  );
}
