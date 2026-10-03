import Link from "next/link";
import { Logo } from "../Logo";
import { getSettings } from "../../../lib/settings";

export async function Footer() {
  const { branding, flags } = await getSettings();

  const product: [string, string][] = [
    ["Features", "/#features"], ["Pricing", "/pricing"], ["How it works", "/#how"],
    ...(flags.blogEnabled ? ([["Blog", "/blog"]] as [string, string][]) : []),
    ["FAQ", "/#faq"],
  ];
  const account: [string, string][] = [
    ["Log in", "/login"], ["Create account", "/login?mode=signup&next=/dashboard"], ["Dashboard", "/dashboard"],
  ];

  return (
    <footer className="border-t border-white/10 px-4 py-14 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-2">
            <Logo logoUrl={branding.logoUrl} siteName={branding.siteName} />
            <p className="lede mt-3 max-w-xs text-sm">{branding.tagline}</p>
          </div>
          {([["Product", product], ["Account", account]] as const).map(([head, links]) => (
            <nav key={head}>
              <h3 className="font-display text-sm text-paper">{head}</h3>
              <ul className="mt-3 space-y-2.5">
                {links.map(([l, h]) => (
                  <li key={l}><Link href={h} className="text-sm text-muted transition-colors hover:text-paper">{l}</Link></li>
                ))}
              </ul>
            </nav>
          ))}
        </div>
        <div className="rule my-9" />
        <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted sm:flex-row">
          <p>© {new Date().getFullYear()} {branding.siteName}</p>
          <a href={`mailto:${branding.supportEmail}`} className="transition-colors hover:text-paper">{branding.supportEmail}</a>
        </div>
      </div>
    </footer>
  );
}
