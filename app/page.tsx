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
      <SiteNav />
      <main className="flex-1">
        <Hero />
        <Problem />
        <Features />
        <HowItWorks />
        <Pricing />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
