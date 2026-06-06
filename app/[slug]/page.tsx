import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, CreditCard, AtSign, MapPin, PenLine } from "lucide-react";
import { buttonClass } from "@/components/ui/button";
import { isReservedSlug } from "@/lib/validation";
import { getPublicArtist } from "@/lib/public-data";
import { FlashGrid } from "@/components/public/flash-grid";
import { BookingForm } from "@/components/public/booking-form";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (isReservedSlug(slug)) return { title: "Introuvable — InkFlow" };
  const data = await getPublicArtist(slug);
  if (!data) return { title: "Introuvable — InkFlow" };
  return {
    title: `${data.artist.display_name} — Réservation tatouage`,
    description: data.artist.bio ?? undefined,
  };
}

const steps = [
  { icon: PenLine, title: "Décrivez votre projet", text: "Type, zone du corps, taille, budget — et vos images de référence." },
  { icon: Calendar, title: "Choisissez un créneau", text: "Parmi les disponibilités réelles du studio." },
  { icon: CreditCard, title: "Réglez l'acompte", text: "Paiement sécurisé par Stripe. La demande est confirmée une fois reçu." },
];

export default async function ArtistPage({ params }: Props) {
  const { slug } = await params;
  if (isReservedSlug(slug)) notFound();

  const data = await getPublicArtist(slug);
  if (!data) notFound();

  const { artist, flash, demo } = data;
  const initials = artist.display_name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen">
      {demo && (
        <div className="bg-ink/10 px-5 py-2 text-center text-xs text-bone-dim">
          Aperçu de démonstration · branchez Supabase pour afficher un vrai studio
        </div>
      )}

      <header className="sticky top-0 z-40 border-b border-line/60 bg-noir/70 backdrop-blur-xl">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
          <span className="font-serif text-lg text-bone">{artist.display_name}</span>
          <a href="#reserver" className={buttonClass("primary", "h-9 px-4 text-sm")}>
            Réserver
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="grain relative overflow-hidden border-b border-line/60">
        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute right-[-5%] top-[-20%] h-72 w-72 rounded-full bg-ink/20 blur-[120px]" />
        </div>
        <div className="mx-auto max-w-4xl px-5 py-16">
          <div className="flex items-center gap-5">
            <div className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-ink/15 font-serif text-3xl text-ink">
              {initials}
            </div>
            <div>
              <h1 className="font-serif text-4xl font-semibold sm:text-5xl">
                {artist.display_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-bone-dim">
                {artist.city && (
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-ink" /> {artist.city}
                  </span>
                )}
                {artist.instagram && (
                  <span className="inline-flex items-center gap-1">
                    <AtSign className="h-4 w-4 text-ink" /> @{artist.instagram}
                  </span>
                )}
              </div>
            </div>
          </div>

          {artist.bio && (
            <p className="mt-6 max-w-2xl text-pretty text-lg text-bone-dim">
              {artist.bio}
            </p>
          )}

          <div className="mt-7 flex flex-wrap gap-3">
            <a href="#reserver" className={buttonClass("primary", "h-11 px-6")}>
              Demander un rendez-vous
            </a>
            <a href="#flash" className={buttonClass("outline", "h-11 px-6")}>
              Voir les flashs
            </a>
          </div>
        </div>
      </section>

      {/* Galerie de flash */}
      <section id="flash" className="scroll-mt-16">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-serif text-2xl font-semibold text-bone sm:text-3xl">
            Flashs disponibles
          </h2>
          <p className="mt-1 text-sm text-bone-dim">
            Réservables en un clic. Acompte requis pour confirmer le rendez-vous.
          </p>
          <div className="mt-8">
            <FlashGrid flash={flash} currency={artist.currency} />
          </div>
        </div>
      </section>

      {/* Réservation */}
      <section id="reserver" className="scroll-mt-16 border-t border-line/60 bg-surface/30">
        <div className="mx-auto max-w-4xl px-5 py-16">
          <h2 className="font-serif text-3xl font-semibold text-bone sm:text-4xl">
            Réserver une séance
          </h2>
          <p className="mt-2 max-w-xl text-bone-dim">
            Un projet personnalisé ? Décrivez-le, joignez vos références et
            choisissez un créneau. Votre demande est confirmée une fois l&apos;acompte
            réglé.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {steps.map((s, i) => (
              <div key={s.title} className="rounded-2xl border border-line bg-noir/40 p-5">
                <div className="flex items-center gap-2 text-ink">
                  <s.icon className="h-5 w-5" />
                  <span className="font-serif text-lg text-bone-dim">0{i + 1}</span>
                </div>
                <h3 className="mt-3 font-serif text-lg text-bone">{s.title}</h3>
                <p className="mt-1 text-sm text-bone-dim">{s.text}</p>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <BookingForm slug={slug} flash={flash} />
          </div>
        </div>
      </section>

      <footer className="border-t border-line/60">
        <div className="mx-auto max-w-4xl px-5 py-8 text-center text-xs text-bone-dim">
          Propulsé par <span className="font-serif text-bone">InkFlow</span>
        </div>
      </footer>
    </div>
  );
}
