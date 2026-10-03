"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Icon, type IconName } from "../_components/Icon";
import { Logo } from "../_components/Logo";

const NAV: { href: string; label: string; icon: IconName }[] = [
  { href: "/admin", label: "Overview", icon: "home" },
  { href: "/admin/users", label: "Users", icon: "user" },
  { href: "/admin/plans", label: "Plans & limits", icon: "zap" },
  { href: "/admin/branding", label: "Branding & site", icon: "spark" },
  { href: "/admin/blog", label: "Blog", icon: "notes" },
  { href: "/admin/activity", label: "Activity log", icon: "history" },
];

export function AdminShell({ email, children }: { email: string; children: ReactNode }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(false); }, [pathname]);

  const isActive = (href: string) => (href === "/admin" ? pathname === "/admin" : pathname.startsWith(href));

  const nav = (
    <nav className="space-y-1">
      {NAV.map((n) => (
        <Link key={n.href} href={n.href}
          className={`relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-colors ${
            isActive(n.href) ? "bg-white/10 text-paper" : "text-muted hover:bg-white/5 hover:text-paper"
          }`}>
          {isActive(n.href) && <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-lamp" />}
          <Icon name={n.icon} size={18} className={isActive(n.href) ? "text-lamp" : ""} />
          {n.label}
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-dvh">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 flex-col border-r border-white/10 bg-[#0a0f1f]/80 p-4 backdrop-blur-xl lg:flex">
        <div className="mb-6 px-1"><Logo href="/admin" size={30} /><p className="mt-1 text-xs text-lamp">Admin panel</p></div>
        {nav}
        <div className="mt-auto space-y-1 pt-4">
          <p className="truncate px-3 text-xs text-muted">{email}</p>
          <Link href="/dashboard" className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-muted hover:bg-white/5 hover:text-paper">
            <Icon name="arrow" size={18} /> Back to the app
          </Link>
        </div>
      </aside>

      <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-white/10 bg-[#0b1020]/85 px-4 backdrop-blur-xl lg:hidden">
        <button type="button" onClick={() => setOpen((v) => !v)} aria-label="Menu" className="rounded-lg p-2 text-paper/80 hover:bg-white/10">
          <Icon name={open ? "x" : "menu"} size={22} />
        </button>
        <Logo href="/admin" size={26} />
        <span className="chip chip-brand ml-auto">Admin</span>
      </header>
      {open && <div className="page-enter border-b border-white/10 p-3 lg:hidden">{nav}</div>}

      <main className="lg:pl-64">{children}</main>
    </div>
  );
}
