import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CreditCard,
  TrendingUp,
  UserX,
} from "lucide-react";
import {
  DEMO_APPOINTMENTS,
  DEMO_BOOKINGS,
  DEMO_STATS,
} from "@/lib/demo";
import { StatusBadge } from "@/components/dashboard/status-badge";

const eur = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export default function DashboardHome() {
  const stats = [
    { label: "CA ce mois", value: eur(DEMO_STATS.revenueMonth), icon: CreditCard },
    { label: "Réservations / semaine", value: String(DEMO_STATS.bookingsWeek), icon: CalendarClock },
    { label: "Taux de remplissage", value: `${DEMO_STATS.fillRate} %`, icon: TrendingUp },
    { label: "No-shows", value: `${DEMO_STATS.noShowRate} %`, icon: UserX },
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
        {stats.map((s) => (
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
          <ul className="divide-y divide-line">
            {DEMO_BOOKINGS.slice(0, 4).map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm text-bone">{b.client_name}</p>
                  <p className="truncate text-xs text-bone-dim">{b.project}</p>
                </div>
                <StatusBadge status={b.status} />
              </li>
            ))}
          </ul>
        </section>

        <section className="rounded-2xl border border-line bg-surface/40">
          <div className="border-b border-line px-5 py-4">
            <h2 className="font-serif text-lg text-bone">Prochains rendez-vous</h2>
          </div>
          <ul className="divide-y divide-line">
            {DEMO_APPOINTMENTS.map((a) => (
              <li
                key={a.id}
                className="flex items-center justify-between gap-3 px-5 py-3"
              >
                <div>
                  <p className="text-sm text-bone">{a.client}</p>
                  <p className="text-xs text-bone-dim">
                    {a.day} · {a.time}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-bone">{eur(a.total)}</p>
                  <p className="text-xs text-bone-dim">acompte {eur(a.deposit)}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
