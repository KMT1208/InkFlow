import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  Inbox,
  Sparkles,
} from "lucide-react";
import { getDashboardOverview } from "@/lib/dashboard-data";
import { StatusBadge } from "@/components/dashboard/status-badge";

const eur = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export default async function DashboardHome() {
  const { stats, recent, upcoming } = await getDashboardOverview();

  const cards = [
    { label: "CA ce mois", value: eur(stats.revenueMonth), icon: CreditCard },
    { label: "Nouvelles demandes", value: String(stats.newRequests), icon: Inbox },
    { label: "RDV à venir", value: String(stats.upcoming), icon: CalendarClock },
    { label: "Demandes ce mois", value: String(stats.requestsMonth), icon: Sparkles },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Vue d&apos;ensemble</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre activité en un coup d&apos;œil.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((s) => (
          <div key={s.label} className="rounded-2xl border border-line bg-surface/40 p-5">
            <div className="flex items-center justify-between">
              <span className="text-sm text-bone-dim">{s.label}</span>
              <s.icon className="h-4 w-4 text-ink" />
            </div>
            <p className="mt-3 font-serif text-3xl text-bone">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-line bg-surface/40">
          <div className="flex items-center justify-between border-b border-line px-5 py-4">
            <h2 className="font-serif text-lg text-bone">Demandes récentes</h2>
            <Link
              href="/dashboard/demandes"
              className="inline-flex items-center gap-1 text-sm text-ink hover:underline"
            >
              Tout voir <ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          </div>
          {recent.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-bone-dim">
              Aucune demande pour l&apos;instant. Partagez votre lien public pour
              commencer à recevoir des réservations.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {recent.map((b) => (
                <li key={b.id}>
                  <Link
                    href={`/dashboard/demandes/${b.id}`}
                    className="flex items-center justify-between gap-3 px-5 py-3 transition-colors hover:bg-surface-2/40"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm text-bone">{b.clientName}</p>
                      <p className="truncate text-xs text-bone-dim">{b.project}</p>
                    </div>
                    <StatusBadge status={b.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="rounded-2xl border border-line bg-surface/40">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-serif text-lg text-bone">Prochains rendez-vous</h2>
          </div>
          {upcoming.length === 0 ? (
            <p className="px-5 py-8 text-center text-sm text-bone-dim">
              Aucun rendez-vous planifié. Acceptez une demande et fixez une date
              pour la voir ici.
            </p>
          ) : (
            <ul className="divide-y divide-line">
              {upcoming.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between gap-3 px-5 py-3"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-bone">{a.client}</p>
                    <p className="truncate text-xs text-bone-dim">{a.whenLabel}</p>
                  </div>
                  {a.total != null && (
                    <div className="shrink-0 text-right">
                      <p className="text-sm text-bone">{eur(a.total)}</p>
                      {a.deposit != null && (
                        <p className="text-xs text-bone-dim">
                          acompte {eur(a.deposit)}
                        </p>
                      )}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
