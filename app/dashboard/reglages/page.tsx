import { Settings } from "lucide-react";

export default function ReglagesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Réglages</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Profil, acomptes, disponibilités et abonnement.
        </p>
      </div>
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface/30 p-16 text-center">
        <Settings className="h-8 w-8 text-ink" />
        <p className="mt-3 font-serif text-xl text-bone">Paramètres du studio</p>
        <p className="mt-1 max-w-sm text-sm text-bone-dim">
          Connexion Stripe, montant d&apos;acompte, thème du mini-site et gestion
          de l&apos;abonnement — arrive en Phase 2.
        </p>
      </div>
    </div>
  );
}
