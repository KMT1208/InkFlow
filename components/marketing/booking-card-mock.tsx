import { CalendarDays, Check, MapPin } from "lucide-react";

// Aperçu produit (mock visuel d'une réservation confirmée), pour le hero.
export function BookingCardMock() {
  return (
    <div className="relative w-full max-w-sm">
      <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-ink/10 blur-2xl" />
      <div className="rounded-3xl border border-line bg-surface/90 p-5 shadow-2xl backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-full bg-ink/15 font-serif text-ink">
              A
            </div>
            <div>
              <p className="text-sm font-medium text-bone">Aïssa M.</p>
              <p className="text-xs text-bone-dim">Projet custom · avant-bras</p>
            </div>
          </div>
          <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-1 text-xs font-medium text-emerald-400">
            <Check className="h-3 w-3" /> Acompte payé
          </span>
        </div>

        <div className="mt-5 space-y-2 rounded-2xl border border-line bg-noir/50 p-4 text-sm">
          <div className="flex items-center gap-2 text-bone-dim">
            <CalendarDays className="h-4 w-4 shrink-0 text-ink" /> Sam. 21 juin · 14:00 — 17:00
          </div>
          <div className="flex items-center gap-2 text-bone-dim">
            <MapPin className="h-4 w-4 shrink-0 text-ink" /> Black Lotus Studio · Lyon
          </div>
        </div>

        <div className="mt-4 flex items-end justify-between">
          <div>
            <p className="text-xs text-bone-dim">Acompte encaissé</p>
            <p className="font-serif text-2xl text-bone">80 €</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-bone-dim">Total estimé</p>
            <p className="font-serif text-2xl text-bone">320 €</p>
          </div>
        </div>
      </div>
    </div>
  );
}
