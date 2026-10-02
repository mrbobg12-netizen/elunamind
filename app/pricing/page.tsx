import type { Metadata } from "next";
import { SiteNav } from "../_components/landing/SiteNav";
import { PricingCards } from "../_components/landing/PricingCards";
import { Faq } from "../_components/landing/Faq";
import { Footer } from "../_components/landing/Footer";

export const metadata: Metadata = { title: "Pricing — Eluna Mind", description: "Start free. Upgrade to Premium for every study tool and higher daily limits." };

export default function PricingPage() {
  return (
    <div className="relative">
      <SiteNav />
      <div className="grid-bg absolute inset-x-0 top-0 -z-10 h-[32rem]" />
      <section className="px-4 pb-20 pt-36 sm:px-6">
        <div className="mx-auto mb-14 max-w-2xl text-center">
          <h1 className="pop-in text-4xl font-bold tracking-tight text-white sm:text-5xl">Simple, <span className="gradient-text">honest pricing</span></h1>
          <p className="pop-in mt-3 text-mute" style={{ animationDelay: ".1s" }}>Start free. Upgrade only when you need more.</p>
        </div>
        <PricingCards />
      </section>
      <section className="px-4 pb-24 sm:px-6"><Faq /></section>
      <Footer />
    </div>
  );
}
