import Link from "next/link";
import { Check } from "lucide-react";
import { buttonClass } from "@/components/ui/button";

const plans = [
  {
    name: "Solo",
    price: "19",
    tagline: "Pour l'artiste indépendant.",
    features: [
      "Page de réservation",
      "Acomptes Stripe",
      "Galerie de flash",
      "Rappels email",
      "Calendrier & disponibilités",
    ],
    featured: false,
  },
  {
    name: "Studio",
    price: "39",
    tagline: "Pour les studios à plusieurs mains.",
    features: [
      "Tout Solo, et en plus :",
      "Rappels SMS illimités",
      "Plusieurs artistes",
      "Statistiques (no-shows, CA)",
      "Domaine personnalisé",
    ],
    featured: true,
  },
];

export function Pricing() {
  return (
    <section id="tarifs" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-6 py-24 sm:py-28">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-xs uppercase tracking-[0.3em] text-ink">Tarifs</span>
          <h2 className="mt-4 font-serif text-4xl font-semibold sm:text-5xl">
            Un prix simple. 14 jours offerts.
          </h2>
          <p className="mt-4 text-lg text-bone-dim">
            Sans engagement, sans carte pour l&apos;essai. Annulez quand vous voulez.
          </p>
        </div>

        <div className="mx-auto mt-14 grid max-w-3xl gap-6 sm:grid-cols-2">
          {plans.map((p) => (
            <div
              key={p.name}
              className={
                p.featured
                  ? "relative rounded-3xl border border-ink/50 bg-surface p-8 shadow-[0_0_70px_-25px] shadow-ink"
                  : "relative rounded-3xl border border-line bg-surface/40 p-8"
              }
            >
              {p.featured && (
                <span className="absolute -top-3 left-8 rounded-full bg-ink px-3 py-1 text-xs font-medium text-white">
                  Le plus choisi
                </span>
              )}
              <h3 className="font-serif text-2xl text-bone">{p.name}</h3>
              <p className="mt-1 text-sm text-bone-dim">{p.tagline}</p>
              <p className="mt-6 flex items-baseline gap-1">
                <span className="font-serif text-5xl text-bone">{p.price}€</span>
                <span className="text-sm text-bone-dim">/ mois</span>
              </p>
              <ul className="mt-6 space-y-3 text-sm">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-bone-dim">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-ink" /> {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/inscription"
                className={buttonClass(p.featured ? "primary" : "outline", "mt-8 w-full")}
              >
                Commencer l&apos;essai
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
