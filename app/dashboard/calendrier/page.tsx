import { CalendarDays } from "lucide-react";

export default function CalendrierPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Calendrier</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Vos rendez-vous et vos disponibilités.
        </p>
      </div>
      <div className="grid place-items-center rounded-2xl border border-dashed border-line bg-surface/30 p-16 text-center">
        <CalendarDays className="h-8 w-8 text-ink" />
        <p className="mt-3 font-serif text-xl text-bone">Vue semaine / mois</p>
        <p className="mt-1 max-w-sm text-sm text-bone-dim">
          Glisser-déposer des créneaux, blocages et gestion des disponibilités —
          arrive en Phase 2.
        </p>
      </div>
    </div>
  );
}
