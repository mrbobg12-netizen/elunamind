import Link from "next/link";
import { Logo } from "../Logo";

const COLS = [
  { head: "Product", links: [["Features", "/#features"], ["Pricing", "/pricing"], ["How it works", "/#how"], ["FAQ", "/#faq"]] },
  { head: "Account", links: [["Log in", "/login"], ["Create account", "/login?mode=signup&next=/dashboard"], ["Dashboard", "/dashboard"]] },
] as const;

export function Footer() {
  return (
    <footer className="border-t border-white/10 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo />
            <p className="lede mt-3 max-w-xs text-sm">An AI tutor for students who study late, in English, Urdu or Roman Urdu.</p>
          </div>
          {COLS.map((c) => (
            <nav key={c.head}>
              <h3 className="font-display text-sm text-paper">{c.head}</h3>
              <ul className="mt-3 space-y-2.5">
                {c.links.map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm text-muted transition-colors hover:text-paper">{l}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="rule my-9" />
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} Eluna Mind</p>
          <a href="mailto:support@elunamind.app" className="transition-colors hover:text-paper">support@elunamind.app</a>
        </div>
      </div>
    </footer>
  );
}
