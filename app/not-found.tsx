import Link from "next/link";
import { SiteNav } from "./_components/landing/SiteNav";
import { Footer } from "./_components/landing/Footer";

export const metadata = { title: "Not found" };

export default function NotFound() {
  return (
    <div className="relative">
      <SiteNav />
      <main className="relative overflow-hidden px-4 pb-32 pt-44 sm:px-6">
        <div className="aurora" />
        <div className="relative mx-auto max-w-lg text-center">
          <div className="seam mx-auto mb-10 h-16 w-px" aria-hidden="true"><span className="seam-spark" /></div>
          <h1 className="text-4xl sm:text-5xl">This page is not here</h1>
          <p className="lede mx-auto mt-4">
            The link may be old, or mistyped. Everything else is where you left it.
          </p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <Link href="/" className="btn btn-primary">Back to the home page</Link>
            <Link href="/dashboard" className="btn btn-ghost">Open the dashboard</Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
