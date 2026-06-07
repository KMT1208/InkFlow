import Link from "next/link";
import { ChevronRight, Paperclip } from "lucide-react";
import { getDashboardBookings } from "@/lib/bookings-data";
import { StatusBadge } from "@/components/dashboard/status-badge";

export default async function DemandesPage() {
  const { bookings } = await getDashboardBookings();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Demandes</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre boîte de réception — fini les DM Instagram.
        </p>
      </div>

      {bookings.length === 0 ? (
        <div className="rounded-2xl border border-line bg-surface/40 p-10 text-center">
          <p className="text-sm text-bone-dim">
            Aucune demande pour l&apos;instant. Partagez votre lien de réservation
            pour recevoir vos premières demandes !
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {bookings.map((b) => (
            <Link
              key={b.id}
              href={`/dashboard/demandes/${b.id}`}
              className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/40 p-5 transition-colors hover:border-ink/40 hover:bg-surface"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-3">
                  <h3 className="font-serif text-lg text-bone">{b.clientName}</h3>
                  <StatusBadge status={b.status} />
                </div>
                <p className="mt-1 truncate text-sm text-bone-dim">{b.project}</p>
                <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bone-dim">
                  {b.bodyZone && <span>Zone : {b.bodyZone}</span>}
                  {b.budget && <span>Budget : {b.budget}</span>}
                  {b.references > 0 && (
                    <span className="inline-flex items-center gap-1">
                      <Paperclip className="h-3 w-3" /> {b.references} réf.
                    </span>
                  )}
                  <span>Reçue {b.createdLabel}</span>
                </p>
              </div>
              <ChevronRight className="h-5 w-5 shrink-0 text-bone-dim" />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
