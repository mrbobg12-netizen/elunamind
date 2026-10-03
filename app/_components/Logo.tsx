import Link from "next/link";

/** The mark. Pass a logoUrl from settings to use a custom image instead of the built-in star. */
export function Logo({ href = "/", size = 34, logoUrl = "", siteName = "Eluna Mind" }:
  { href?: string; size?: number; logoUrl?: string; siteName?: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 text-paper">
      {logoUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={logoUrl} alt="" width={size} height={size} className="rounded-xl object-contain" style={{ width: size, height: size }} />
      ) : (
        <span className="relative grid place-items-center rounded-xl"
          style={{ width: size, height: size, background: "var(--lamp)", boxShadow: "0 8px 22px -10px rgba(245,181,68,.9)" }}>
          <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#231704" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
          </svg>
        </span>
      )}
      <span className="font-display text-[1.08rem] tracking-tight">{siteName}</span>
    </Link>
  );
}
