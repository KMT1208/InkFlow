import Link from "next/link";
import { ChevronRight, Paperclip } from "lucide-react";
import { DEMO_BOOKINGS } from "@/lib/demo";
import { StatusBadge } from "@/components/dashboard/status-badge";

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
          <Link
            key={b.id}
            href={`/dashboard/demandes/${b.id}`}
            className="flex items-center justify-between gap-4 rounded-2xl border border-line bg-surface/40 p-5 transition-colors hover:border-ink/40 hover:bg-surface"
          >
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <h3 className="font-serif text-lg text-bone">{b.client_name}</h3>
                <StatusBadge status={b.status} />
              </div>
              <p className="mt-1 truncate text-sm text-bone-dim">{b.project}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-bone-dim">
                <span>Zone : {b.body_zone}</span>
                <span>Budget : {b.budget}</span>
                {b.references > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Paperclip className="h-3 w-3" /> {b.references} réf.
                  </span>
                )}
                <span>Reçue {b.created}</span>
              </p>
            </div>
            <ChevronRight className="h-5 w-5 shrink-0 text-bone-dim" />
          </Link>
        ))}
      </div>
    </div>
  );
}
