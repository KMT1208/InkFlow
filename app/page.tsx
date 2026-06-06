import type { Metadata } from "next";
import { SiteNav } from "@/components/marketing/site-nav";
import { Hero } from "@/components/marketing/hero";
import { Problem } from "@/components/marketing/problem";
import { Features } from "@/components/marketing/features";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { Pricing } from "@/components/marketing/pricing";
import { Faq } from "@/components/marketing/faq";
import { FinalCta } from "@/components/marketing/cta";
import { SiteFooter } from "@/components/marketing/site-footer";
import { Reveal } from "@/components/marketing/reveal";

export const metadata: Metadata = {
  title: "InkFlow — La réservation pensée pour les tatoueurs",
  description:
    "Remplacez le chaos des DM Instagram par une page de réservation qui encaisse l'acompte, planifie le créneau et envoie les rappels. Essai 14 jours, sans carte.",
  openGraph: {
    title: "InkFlow — La réservation pensée pour les tatoueurs",
    description:
      "La page de réservation qui encaisse l'acompte, planifie le créneau et envoie les rappels. Vous tatouez, on gère le reste.",
    type: "website",
    locale: "fr_FR",
  },
};

export default function Home() {
  return (
    <>
      <a
        href="#contenu"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-lg focus:bg-ink focus:px-4 focus:py-2 focus:text-sm focus:text-white"
      >
        Aller au contenu
      </a>
      <SiteNav />
      <main id="contenu" className="flex-1">
        <Hero />
        <Reveal>
          <Problem />
        </Reveal>
        <Reveal>
          <Features />
        </Reveal>
        <Reveal>
          <HowItWorks />
        </Reveal>
        <Reveal>
          <Pricing />
        </Reveal>
        <Reveal>
          <Faq />
        </Reveal>
        <Reveal>
          <FinalCta />
        </Reveal>
      </main>
      <SiteFooter />
    </>
  );
}
