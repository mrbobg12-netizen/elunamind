import Link from "next/link";
import { Logo } from "../Logo";

export function Footer() {
  return (
    <footer className="border-t border-white/[0.07] px-4 py-10">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-5 sm:flex-row">
        <div className="flex flex-col items-center gap-2 sm:items-start"><Logo /><p className="text-xs text-mute">Smarter studying with AI.</p></div>
        <nav className="flex flex-wrap justify-center gap-5 text-sm text-mute">
          <Link href="/#features" className="hover:text-white">Features</Link>
          <Link href="/pricing" className="hover:text-white">Pricing</Link>
          <Link href="/login" className="hover:text-white">Log in</Link>
          <a href="mailto:support@elunamind.app" className="hover:text-white">support@elunamind.app</a>
        </nav>
        <p className="text-xs text-mute/80">© {new Date().getFullYear()} Eluna Mind</p>
      </div>
    </footer>
  );
}
