import Link from "next/link";
import { Icon } from "./_components/Icon";
import { Reveal } from "./_components/Reveal";
import { TOOLS } from "./_components/tools";
import { SiteNav } from "./_components/landing/SiteNav";
import { DemoLoop } from "./_components/landing/DemoLoop";
import { WhyUs } from "./_components/landing/WhyUs";
import { PricingCards } from "./_components/landing/PricingCards";
import { Faq } from "./_components/landing/Faq";
import { Footer } from "./_components/landing/Footer";
import { getSettings } from "../lib/settings";

const STEPS = [
  { t: "Create a free account", d: "Email and a password. No card, nothing to install." },
  { t: "Ask, or pick a tool", d: "Type a question to the tutor, paste a chapter for notes, or open any of the twelve tools." },
  { t: "Keep what you make", d: "Chats and notes stay in your account, and your remaining daily uses are always on screen." },
];

function SectionHead({ kicker, title, sub }: { kicker: string; title: string; sub?: string }) {
  return (
    <div className="mb-12 max-w-2xl">
      <p className="mb-3 text-sm text-lamp">{kicker}</p>
      <h2 className="text-3xl sm:text-4xl">{title}</h2>
      {sub && <p className="lede mt-3">{sub}</p>}
    </div>
  );
}

export default async function Landing() {
  const { branding, rules } = await getSettings();
  const isPremium = (key: (typeof TOOLS)[number]["key"]) => rules[key].premiumOnly;
  const free = TOOLS.filter((t) => !isPremium(t.key));
  const premium = TOOLS.filter((t) => isPremium(t.key));
  const loop = [...TOOLS, ...TOOLS];

  return (
    <div className="relative">
      <SiteNav />

      {/* ---------------- HERO ---------------- */}
      <section className="relative overflow-hidden px-4 pb-16 pt-28 sm:px-6 sm:pt-36">
        <div className="lamp-glow left-1/2 top-[-6rem] h-[26rem] w-[40rem] -translate-x-1/2 bg-amber-400/12" />
        <div className="lamp-glow -left-40 top-40 h-80 w-80 bg-indigo-500/15" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.02fr_1fr]">
          <div className="page-enter">
            <p className="chip chip-brand mb-6">Built for late-night study</p>
            <h1 className="text-[2.6rem] sm:text-6xl">{branding.heroHeadline}</h1>
            <p className="lede mt-6 text-lg">{branding.heroSubline}</p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="/login?mode=signup&next=/dashboard" className="btn btn-primary !px-6 !py-3.5 text-base">Start free</Link>
              <Link href="/#features" className="btn btn-ghost !px-6 !py-3.5 text-base">See the tools</Link>
            </div>
            <p className="mt-5 text-sm text-muted">Free plan, no card. {rules.chat.freePerDay} tutor messages and {rules.notes.freePerDay} note sets every day.</p>
          </div>
          <div className="float-y"><DemoLoop /></div>
        </div>
      </section>

      {/* tool ticker */}
      <div className="overflow-hidden border-y border-white/10 py-3.5">
        <div className="marquee gap-2.5">
          {loop.map((t, i) => (
            <span key={i} className="mx-1 inline-flex items-center gap-2 whitespace-nowrap px-3 text-sm text-muted">
              <Icon name={t.icon} size={14} className="text-lamp/70" /> {t.title}
            </span>
          ))}
        </div>
      </div>

      {/* ---------------- FEATURES ---------------- */}
      <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal><SectionHead kicker="Twelve tools, one account" title="Everything an exam week asks for" sub="Five are free to use every day. The rest come with Premium." /></Reveal>

          <Reveal>
            <div className="grid gap-px overflow-hidden rounded-2xl border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
              {free.map((t) => (
                <div key={t.key} className="card-hover bg-[#0d1426] p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <Icon name={t.icon} size={22} className="text-lamp" />
                    <span className="chip chip-ok">Free</span>
                  </div>
                  <h3 className="font-display text-lg text-paper">{rules[t.key].label || t.title}</h3>
                  <p className="lede mt-1.5 text-sm">{t.desc}</p>
                </div>
              ))}
              <div className="grid place-items-center bg-[#0d1426] p-6 text-center">
                <div>
                  <p className="font-display text-lg text-paper">Start with these five</p>
                  <Link href="/login?mode=signup&next=/dashboard" className="btn btn-ghost btn-sm mt-3">Create free account</Link>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal>
            <p className="mb-5 mt-14 text-sm text-muted">With Premium you also get</p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {premium.map((t, i) => (
                <div key={t.key} className="glass card-hover rounded-xl p-5" style={{ animationDelay: `${i * 40}ms` }}>
                  <Icon name={t.icon} size={20} className="text-lamp" />
                  <h3 className="mt-3 font-display text-base text-paper">{t.title}</h3>
                  <p className="lede mt-1 text-sm">{t.desc}</p>
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ---------------- WHY ---------------- */}
      <section id="why" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal><SectionHead kicker="Why Eluna" title="Made to be studied with, not just chatted at" /></Reveal>
          <WhyUs />
        </div>
      </section>

      {/* ---------------- HOW ---------------- */}
      <section id="how" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal><SectionHead kicker="Getting started" title="Three steps, about a minute" /></Reveal>
          <ol className="relative mx-auto max-w-2xl">
            {STEPS.map((s, i) => (
              <Reveal key={s.t} delay={i * 110}>
                <li className="relative flex gap-5 pb-10 last:pb-0">
                  <div className="flex flex-col items-center">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-amber-400/40 bg-amber-400/10 font-display text-sm text-lamp">{i + 1}</span>
                    {i < STEPS.length - 1 && <span className="mt-1 w-px flex-1 bg-white/10" />}
                  </div>
                  <div className="pb-2">
                    <h3 className="font-display text-lg text-paper">{s.t}</h3>
                    <p className="lede mt-1 text-sm">{s.d}</p>
                  </div>
                </li>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------------- CHAT SPOTLIGHT ---------------- */}
      <section className="px-4 py-24 sm:px-6">
        <Reveal>
          <div className="glass-strong relative mx-auto max-w-6xl overflow-hidden rounded-[1.75rem] p-8 sm:p-14">
            <div className="lamp-glow -right-24 -top-24 h-72 w-72 bg-amber-400/18" />
            <div className="relative grid items-center gap-12 lg:grid-cols-2">
              <div>
                <p className="mb-3 text-sm text-lamp">Tutor chat</p>
                <h2 className="text-3xl sm:text-4xl">Ask the thing you were too shy to ask in class</h2>
                <p className="lede mt-4">No question is too basic, and you can ask the same one five different ways until it clicks.</p>
                <Link href="/login?mode=signup&next=/dashboard/chat" className="btn btn-primary mt-8">Try the tutor</Link>
              </div>
              <ul className="space-y-3">
                {["Quiz me on World War 2", "Mujhe derivatives asaan tareeqe se samjhao", "Make a 7-day plan for my chemistry exam", "Why did I lose marks on this answer?"].map((p, i) => (
                  <Reveal key={p} delay={i * 90}>
                    <li className="rounded-xl border border-white/10 bg-white/[0.04] px-5 py-3.5 text-paper/85">{p}</li>
                  </Reveal>
                ))}
              </ul>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ---------------- PRICING ---------------- */}
      <section id="pricing" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal><SectionHead kicker="Pricing" title="Free to study with. Premium when exams get close." /></Reveal>
          <Reveal><PricingCards /></Reveal>
        </div>
      </section>

      {/* ---------------- FAQ ---------------- */}
      <section id="faq" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal><SectionHead kicker="Questions" title="Before you sign up" /></Reveal>
          <Reveal><Faq /></Reveal>
        </div>
      </section>

      {/* ---------------- CTA ---------------- */}
      <section className="px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[1.75rem] border border-amber-400/25 px-8 py-16 text-center sm:px-14" style={{ background: "radial-gradient(120% 120% at 50% 0%, rgba(245,181,68,.16), rgba(11,16,32,0) 70%)" }}>
            <h2 className="text-3xl sm:text-4xl">Your next study session starts here</h2>
            <p className="lede mx-auto mt-4">Create a free account and ask your first question in under a minute.</p>
            <Link href="/login?mode=signup&next=/dashboard" className="btn btn-primary mt-8 !px-7 !py-3.5 text-base">Start free</Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
