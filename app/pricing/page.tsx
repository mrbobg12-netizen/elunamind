import type { Metadata } from "next";
import { SiteNav } from "../_components/landing/SiteNav";
import { PricingCards } from "../_components/landing/PricingCards";
import { Faq } from "../_components/landing/Faq";
import { Footer } from "../_components/landing/Footer";

export const metadata: Metadata = {
  title: "Pricing — Eluna Mind",
  description: "Free to study with every day. Premium unlocks every tool and much higher daily limits.",
};

export default function PricingPage() {
  return (
    <div className="relative">
      <SiteNav />
      <section className="relative overflow-hidden px-4 pb-20 pt-36 sm:px-6">
        <div className="lamp-glow left-1/2 top-0 h-80 w-[36rem] -translate-x-1/2 bg-amber-400/12" />
        <div className="relative mx-auto mb-14 max-w-2xl text-center">
          <h1 className="page-enter text-4xl sm:text-5xl">Free to study with. Premium when exams get close.</h1>
          <p className="lede page-enter mx-auto mt-4">No trials that expire, no card to start. Upgrade the week you actually need it.</p>
        </div>
        <PricingCards />
      </section>
      <section className="px-4 pb-24 sm:px-6"><Faq /></section>
      <Footer />
    </div>
  );
}
