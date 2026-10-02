import Link from "next/link";
import { Icon } from "./_components/Icon";
import { Reveal } from "./_components/Reveal";
import { TOOLS } from "./_components/tools";
import { SiteNav } from "./_components/landing/SiteNav";
import { PricingCards } from "./_components/landing/PricingCards";
import { Faq } from "./_components/landing/Faq";
import { Footer } from "./_components/landing/Footer";

const STEPS = [
  { n: "01", t: "Create a free account", d: "Sign up in seconds with email. No card needed." },
  { n: "02", t: "Pick a tool or just ask", d: "Chat with your AI tutor, generate notes, practise questions or plan your exam." },
  { n: "03", t: "Study, save and improve", d: "Everything is saved to your account, and you always see what is left of your daily limit." },
];

function HeroMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="orb -left-10 top-10 h-52 w-52 bg-violet-600/60" />
      <div className="orb -bottom-6 right-0 h-52 w-52 bg-cyan-500/40" style={{ animationDelay: "-7s" }} />
      <div className="glass-strong float-y relative rounded-3xl p-4 shadow-2xl shadow-violet-900/30 sm:p-5">
        <div className="mb-4 flex items-center gap-2 border-b border-white/10 pb-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-amber-400/80" /><span className="h-2.5 w-2.5 rounded-full bg-emerald-400/80" />
          <span className="ml-2 text-xs text-mute">Eluna · AI Tutor</span>
          <span className="chip chip-ok ml-auto">Example</span>
        </div>
        <div className="space-y-3 text-sm">
          <div className="pop-in flex justify-end" style={{ animationDelay: ".4s" }}><div className="max-w-[85%] rounded-2xl rounded-br-md px-4 py-2.5 text-white" style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)" }}>Explain photosynthesis like I&apos;m 12</div></div>
          <div className="pop-in flex gap-2.5" style={{ animationDelay: "1.2s" }}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}><Icon name="spark" size={14} /></span>
            <div className="rounded-2xl rounded-tl-md bg-white/[0.06] px-4 py-3 text-slate-200">
              Plants make their own food using sunlight. Think of a leaf as a tiny kitchen:
              <ul className="mt-2 space-y-1 text-[0.82rem] text-slate-300">
                <li><b className="text-white">Ingredients:</b> sunlight, water, and carbon dioxide</li>
                <li><b className="text-white">Chef:</b> chlorophyll, the green stuff in leaves</li>
                <li><b className="text-white">Result:</b> sugar for energy, plus oxygen for us</li>
              </ul>
            </div>
          </div>
          <div className="pop-in flex gap-2.5" style={{ animationDelay: "2s" }}>
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg text-white" style={{ background: "linear-gradient(135deg,#8b5cf6,#22d3ee)" }}><Icon name="spark" size={14} /></span>
            <div className="dots rounded-2xl bg-white/[0.06] px-4 py-3"><span /><span /><span /></div>
          </div>
        </div>
      </div>
      <div className="glass pop-in absolute -right-2 -top-5 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs text-white sm:flex" style={{ animationDelay: "1.6s" }}><Icon name="notes" size={16} className="text-violet-300" /> Notes saved</div>
      <div className="glass pop-in absolute -bottom-5 -left-3 hidden items-center gap-2 rounded-2xl px-3.5 py-2.5 text-xs text-white sm:flex" style={{ animationDelay: "2.2s" }}><Icon name="zap" size={16} className="text-cyan-300" /> 14 of 15 messages left today</div>
    </div>
  );
}

export default function Landing() {
  const loop = [...TOOLS, ...TOOLS];
  return (
    <div className="relative">
      <SiteNav />

      {/* HERO */}
      <section className="relative overflow-hidden px-4 pb-20 pt-32 sm:px-6 sm:pt-40">
        <div className="grid-bg absolute inset-0 -z-10" />
        <div className="mx-auto grid max-w-6xl items-center gap-14 lg:grid-cols-[1.05fr_.95fr]">
          <div>
            <div className="pop-in chip chip-brand mb-5"><Icon name="spark" size={12} /> Your AI study companion</div>
            <h1 className="pop-in text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-6xl" style={{ animationDelay: ".08s" }}>
              Study smarter with an <span className="gradient-text">AI tutor</span> that explains, quizzes and plans.
            </h1>
            <p className="pop-in mt-5 max-w-xl text-lg leading-relaxed text-mute" style={{ animationDelay: ".16s" }}>
              Chat with your tutor, turn any text into notes, practise with questions and build a study plan, all in one place. Ask in English, Urdu or Roman Urdu.
            </p>
            <div className="pop-in mt-8 flex flex-wrap items-center gap-3" style={{ animationDelay: ".24s" }}>
              <Link href="/login?mode=signup&next=/dashboard" className="btn btn-primary !px-6 !py-3.5 text-base">Start free trial <Icon name="arrow" size={18} /></Link>
              <Link href="/#features" className="btn btn-ghost !px-6 !py-3.5 text-base">See what&apos;s inside</Link>
            </div>
            <p className="pop-in mt-4 flex items-center gap-2 text-sm text-mute" style={{ animationDelay: ".3s" }}><Icon name="shield" size={15} className="text-emerald-400" /> Free plan included. No credit card required.</p>
          </div>
          <HeroMock />
        </div>
      </section>

      {/* TOOL MARQUEE */}
      <div className="overflow-hidden border-y border-white/[0.07] bg-white/[0.02] py-4">
        <div className="marquee gap-3">
          {loop.map((t, i) => (
            <span key={i} className="mx-1.5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm text-slate-300">
              <Icon name={t.icon} size={15} className="text-violet-300" /> {t.title}
            </span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section id="features" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to <span className="gradient-text">learn faster</span></h2>
            <p className="mt-3 text-mute">Twelve study tools that work together, from quick answers to full exam preparation.</p>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {TOOLS.map((t, i) => (
              <Reveal key={t.key} delay={(i % 3) * 80}>
                <div className="glass card-hover h-full rounded-2xl p-6">
                  <div className="mb-4 flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: `linear-gradient(135deg, ${t.grad[0]}, ${t.grad[1]})`, boxShadow: `0 12px 28px -12px ${t.grad[0]}` }}><Icon name={t.icon} size={24} /></span>
                    {t.premium ? <span className="chip chip-brand">Premium</span> : <span className="chip chip-ok">Free</span>}
                  </div>
                  <h3 className="font-semibold text-white">{t.title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{t.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* HOW */}
      <section id="how" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <div className="mx-auto max-w-5xl">
          <Reveal className="mx-auto mb-14 max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Up and running in <span className="gradient-text">three steps</span></h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {STEPS.map((s, i) => (
              <Reveal key={s.n} delay={i * 120}>
                <div className="glass h-full rounded-2xl p-6">
                  <span className="gradient-text text-4xl font-bold">{s.n}</span>
                  <h3 className="mt-3 text-lg font-semibold text-white">{s.t}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-mute">{s.d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CHAT SPOTLIGHT */}
      <section className="px-4 py-24 sm:px-6">
        <Reveal>
          <div className="glass-strong relative mx-auto max-w-6xl overflow-hidden rounded-[2rem] p-8 sm:p-12">
            <div className="orb -right-16 -top-16 h-72 w-72 bg-violet-600/40" />
            <div className="relative grid items-center gap-10 lg:grid-cols-2">
              <div>
                <span className="chip chip-brand mb-4"><Icon name="chat" size={12} /> AI Tutor Chat</span>
                <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">A tutor that is awake whenever you are</h2>
                <ul className="mt-6 space-y-3.5 text-slate-300">
                  {["Step-by-step explanations in simple language", "Understands English, Urdu and Roman Urdu", "Every conversation is saved so you can continue later", "A live counter always shows how many messages you have left today"].map((x) => (
                    <li key={x} className="flex items-start gap-3"><Icon name="check" size={18} className="mt-0.5 shrink-0 text-emerald-400" />{x}</li>
                  ))}
                </ul>
                <Link href="/login?mode=signup&next=/dashboard/chat" className="btn btn-primary mt-8">Try the tutor free <Icon name="arrow" size={16} /></Link>
              </div>
              <div className="space-y-3">
                {["Quiz me on World War 2", "Mujhe derivatives asaan tareeqe se samjhao", "Make a 7-day plan for my chemistry exam"].map((p, i) => (
                  <Reveal key={p} delay={i * 100}><div className="glass rounded-2xl px-5 py-4 text-slate-200"><span className="mr-2 text-violet-300">›</span>{p}</div></Reveal>
                ))}
              </div>
            </div>
          </div>
        </Reveal>
      </section>

      {/* PRICING */}
      <section id="pricing" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal className="mx-auto mb-14 max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Simple, <span className="gradient-text">honest pricing</span></h2>
          <p className="mt-3 text-mute">Start free. Upgrade only when you need more.</p>
        </Reveal>
        <Reveal><PricingCards /></Reveal>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-20 px-4 py-24 sm:px-6">
        <Reveal className="mx-auto mb-12 max-w-2xl text-center"><h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">Questions, answered</h2></Reveal>
        <Reveal><Faq /></Reveal>
      </section>

      {/* FINAL CTA */}
      <section className="px-4 pb-24 sm:px-6">
        <Reveal>
          <div className="relative mx-auto max-w-4xl overflow-hidden rounded-[2rem] p-10 text-center sm:p-14" style={{ background: "linear-gradient(135deg, rgba(139,92,246,.35), rgba(34,211,238,.18))", border: "1px solid rgba(255,255,255,.12)" }}>
            <div className="orb -left-10 -top-10 h-56 w-56 bg-pink-500/30" />
            <h2 className="relative text-3xl font-bold text-white sm:text-4xl">Ready to study smarter?</h2>
            <p className="relative mx-auto mt-3 max-w-lg text-slate-200/80">Join the free plan today and ask your first question in under a minute.</p>
            <Link href="/login?mode=signup&next=/dashboard" className="btn btn-primary relative mt-7 !px-7 !py-3.5 text-base">Start free trial <Icon name="arrow" size={18} /></Link>
          </div>
        </Reveal>
      </section>

      <Footer />
    </div>
  );
}
