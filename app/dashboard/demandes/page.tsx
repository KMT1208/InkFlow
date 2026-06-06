import { Check, FileText, X } from "lucide-react";
import { DEMO_BOOKINGS } from "@/lib/demo";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { buttonClass } from "@/components/ui/button";

export default function DemandesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Demandes</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre boîte de réception — fini les DM Instagram.
        </p>
      </div>

      <div className="space-y-3">
        {DEMO_BOOKINGS.map((b) => (
          <div
            key={b.id}
            className="rounded-2xl border border-line bg-surface/40 p-5 transition-colors hover:border-ink/30"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-lg text-bone">{b.client_name}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 text-sm text-bone-dim">{b.project}</p>
                <p className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-bone-dim">
                  <span>Zone : {b.body_zone}</span>
                  <span>Budget : {b.budget}</span>
                  <span>Reçue {b.created}</span>
                </p>
              </div>
              <div className="flex shrink-0 gap-2">
                <button className={buttonClass("outline", "h-9 px-3 text-sm")}>
                  <FileText className="mr-1.5 h-4 w-4" /> Devis
                </button>
                <button className={buttonClass("primary", "h-9 px-3 text-sm")}>
                  <Check className="mr-1.5 h-4 w-4" /> Accepter
                </button>
                <button
                  aria-label="Refuser"
                  className={buttonClass("ghost", "h-9 px-3 text-sm")}
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
