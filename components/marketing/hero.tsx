import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { HeroVisual } from "@/components/marketing/hero-visual";

export function Hero() {
  return (
    <section className="grain relative overflow-hidden">
      {/* Halos d'encre animés + grille en fond. */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[60vh] w-[60vh] -translate-x-1/2 rounded-full bg-ink/25 blur-[140px] animate-drift" />
        <div className="absolute right-[-10%] top-[20%] h-[40vh] w-[40vh] rounded-full bg-ink-dark/20 blur-[120px] animate-drift-slow" />
        <div className="absolute inset-0 bg-grid opacity-[0.15] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />
      </div>

      <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:gap-8">
        <div className="animate-rise">
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-surface/60 px-3 py-1 text-xs uppercase tracking-[0.2em] text-bone-dim">
            <span className="h-1.5 w-1.5 rounded-full bg-ink" /> Le studio, sans les DM
          </span>
          <h1 className="mt-6 text-balance font-serif text-5xl font-semibold leading-[1.05] sm:text-6xl lg:text-7xl">
            Vos rendez-vous,
            <br />
            <span className="text-ink">en pilote automatique.</span>
          </h1>
          <p className="mt-6 max-w-md text-pretty text-lg text-bone-dim">
            InkFlow remplace le chaos des DM Instagram par une page de réservation
            qui encaisse l&apos;acompte, cale le créneau et envoie les rappels.
            Vous tatouez — on gère le reste.
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href="/inscription"
              className={buttonClass("primary", "group h-12 px-7 text-base")}
            >
              Créer mon studio
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a href="#fonctionnalites" className={buttonClass("outline", "h-12 px-7 text-base")}>
              Voir comment
            </a>
          </div>
          <p className="mt-6 flex items-center gap-2 text-sm text-bone-dim">
            <ShieldCheck className="h-4 w-4 text-ink" /> Sans engagement · 14 jours
            d&apos;essai · Acomptes sécurisés par Stripe
          </p>
        </div>

        <div className="lg:justify-self-end">
          <HeroVisual />
        </div>
      </div>
    </section>
  );
}
