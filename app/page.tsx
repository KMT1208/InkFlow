import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

// Page d'accueil minimaliste de la plateforme (la landing marketing est
// distincte). Elle reste statique : elle n'interroge pas Supabase.
export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center px-6 py-24 text-center">
      <p className="mb-6 text-xs uppercase tracking-[0.4em] text-ink">
        Studio · Réservation
      </p>
      <h1 className="font-serif text-6xl font-semibold sm:text-7xl">InkFlow</h1>
      <p className="mt-6 max-w-md text-balance text-bone-dim">
        La page de réservation pensée pour les tatoueurs. Portfolio, projet du
        client, créneau et acompte — réunis dans un seul lien.
      </p>
      <div className="mt-10 flex flex-col gap-3 sm:flex-row">
        <Link href="/inscription" className={buttonClass("primary")}>
          Créer mon studio
        </Link>
        <Link href="/connexion" className={buttonClass("outline")}>
          Se connecter
        </Link>
      </div>
    </main>
  );
}
