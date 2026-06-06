import Link from "next/link";
import { buttonClass } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-ink">404</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold">Studio introuvable</h1>
        <p className="mt-3 text-bone-dim">
          Ce lien ne correspond à aucun studio InkFlow.
        </p>
        <Link href="/" className={buttonClass("primary", "mt-8")}>
          Retour à l&apos;accueil
        </Link>
      </div>
    </div>
  );
}
