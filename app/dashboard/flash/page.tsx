import { Images } from "lucide-react";

export default function FlashPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Flashs</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre galerie réservable en un clic.
        </p>
      </div>
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface/30 p-16 text-center">
        <Images className="h-8 w-8 text-ink" />
        <p className="mt-3 font-serif text-xl text-bone">Gestion des flashs</p>
        <p className="mt-1 max-w-sm text-sm text-bone-dim">
          Upload en masse, prix, taille, emplacements et disponibilité — arrive
          en Phase 2.
        </p>
      </div>
    </div>
  );
}
