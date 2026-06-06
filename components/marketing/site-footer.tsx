import Link from "next/link";
import { Wordmark } from "@/components/wordmark";

export function SiteFooter() {
  return (
    <footer className="border-t border-line/60">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-12 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Wordmark />
          <p className="mt-2 text-sm text-bone-dim">
            La réservation pensée pour les tatoueurs.
          </p>
        </div>
        <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm text-bone-dim">
          <a href="#fonctionnalites" className="hover:text-bone">Fonctionnalités</a>
          <a href="#tarifs" className="hover:text-bone">Tarifs</a>
          <a href="#faq" className="hover:text-bone">FAQ</a>
          <Link href="/connexion" className="hover:text-bone">Se connecter</Link>
        </div>
      </div>
      <div className="border-t border-line/60">
        <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-bone-dim">
          © {new Date().getFullYear()} InkFlow · Conçu pour les studios de
          tatouage · Hébergé en Europe (RGPD)
        </div>
      </div>
    </footer>
  );
}
