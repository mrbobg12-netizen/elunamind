import Link from "next/link";

export function Logo({ href = "/", size = 34 }: { href?: string; size?: number }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2.5 font-bold tracking-tight text-white">
      <span className="relative grid place-items-center rounded-xl" style={{ width: size, height: size, background: "linear-gradient(135deg,#8b5cf6,#22d3ee)", boxShadow: "0 8px 24px -8px rgba(139,92,246,.9)" }}>
        <svg width={size * 0.58} height={size * 0.58} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <path d="M12 3l1.9 5.1L19 10l-5.1 1.9L12 17l-1.9-5.1L5 10l5.1-1.9z" />
        </svg>
      </span>
      <span className="text-[1.05rem]">Eluna <span className="gradient-text">Mind</span></span>
    </Link>
  );
}
