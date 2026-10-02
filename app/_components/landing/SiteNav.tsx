"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { Icon } from "../Icon";
import { NavAuth } from "./NavAuth";

const LINKS = [["Features", "/#features"], ["How it works", "/#how"], ["Pricing", "/#pricing"], ["FAQ", "/#faq"]] as const;

export function SiteNav() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 12);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  return (
    <header className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${scrolled || open ? "border-b border-white/[0.08] bg-[#07070d]/80 backdrop-blur-xl" : "border-b border-transparent"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Logo />
        <nav className="hidden items-center gap-1 md:flex">
          {LINKS.map(([l, h]) => <Link key={l} href={h} className="rounded-lg px-3 py-2 text-sm text-mute transition hover:bg-white/5 hover:text-white">{l}</Link>)}
        </nav>
        <div className="flex items-center gap-2">
          <NavAuth />
          <button type="button" className="rounded-lg p-2 text-slate-200 hover:bg-white/10 md:hidden" aria-label="Menu" onClick={() => setOpen((v) => !v)}><Icon name={open ? "x" : "menu"} size={22} /></button>
        </div>
      </div>
      {open && (
        <nav className="pop-in flex flex-col gap-1 border-t border-white/[0.07] px-4 pb-4 pt-2 md:hidden">
          {LINKS.map(([l, h]) => <Link key={l} href={h} onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-slate-200 hover:bg-white/5">{l}</Link>)}
          <Link href="/login" onClick={() => setOpen(false)} className="rounded-lg px-3 py-3 text-slate-200 hover:bg-white/5">Log in</Link>
        </nav>
      )}
    </header>
  );
}
