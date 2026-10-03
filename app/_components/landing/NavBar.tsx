"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Logo } from "../Logo";
import { Icon } from "../Icon";
import { NavAuth } from "./NavAuth";

export function NavBar({ siteName, logoUrl, blogEnabled, notice }:
  { siteName: string; logoUrl: string; blogEnabled: boolean; notice: string }) {
  const [solid, setSolid] = useState(false);
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState(false);

  const links: [string, string][] = [
    ["Features", "/#features"], ["Why Eluna", "/#why"], ["How it works", "/#how"], ["Pricing", "/#pricing"],
    ...(blogEnabled ? ([["Blog", "/blog"]] as [string, string][]) : []),
    ["FAQ", "/#faq"],
  ];

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setSolid(y > 24);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? y / max : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div className="scroll-progress w-full" style={{ transform: `scaleX(${progress})` }} aria-hidden="true" />
      {notice && (
        <div className="fixed inset-x-0 top-0 z-[55] bg-lamp px-4 py-1.5 text-center text-sm text-[#231704]">{notice}</div>
      )}
      <header className={`fixed inset-x-0 z-50 transition-colors duration-300 ${notice ? "top-8" : "top-0"} ${solid || open ? "border-b border-white/10 bg-[#0b1020]/85 backdrop-blur-xl" : "border-b border-transparent"}`}>
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
          <Logo logoUrl={logoUrl} siteName={siteName} />
          <nav className="hidden flex-1 items-center gap-1 md:flex">
            {links.map(([l, h]) => (
              <Link key={l} href={h} className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-paper">{l}</Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-2 md:ml-0">
            <NavAuth />
            <button type="button" className="rounded-lg p-2 text-paper/80 hover:bg-white/10 md:hidden"
              aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
              <Icon name={open ? "x" : "menu"} size={22} />
            </button>
          </div>
        </div>
        {open && (
          <nav className="page-enter border-t border-white/10 px-4 pb-4 pt-2 md:hidden">
            {links.map(([l, h]) => (
              <Link key={l} href={h} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-paper/90 hover:bg-white/5">{l}</Link>
            ))}
            <Link href="/login" onClick={() => setOpen(false)} className="block rounded-lg px-3 py-3 text-paper/90 hover:bg-white/5">Log in</Link>
          </nav>
        )}
      </header>
    </>
  );
}
