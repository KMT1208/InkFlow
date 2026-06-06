import type { ReactNode } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Mail, Paperclip, Phone } from "lucide-react";
import { getDemoBooking } from "@/lib/demo";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { StatusBadge } from "@/components/dashboard/status-badge";
import { BookingActions } from "@/components/dashboard/booking-actions";

type Props = { params: Promise<{ id: string }> };

const refGradients = [
  "from-ink/30 to-noir",
  "from-violet-500/20 to-noir",
  "from-amber-500/20 to-noir",
  "from-sky-500/15 to-noir",
  "from-rose-500/20 to-noir",
];

export default async function DemandeDetail({ params }: Props) {
  const { id } = await params;
  const b = getDemoBooking(id);
  if (!b) notFound();

  return (
    <div className="space-y-6">
      <Link
        href="/dashboard/demandes"
        className="inline-flex items-center gap-1 text-sm text-bone-dim transition-colors hover:text-bone"
      >
        <ArrowLeft className="h-4 w-4" /> Demandes
      </Link>

      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-serif text-3xl font-semibold">{b.client_name}</h1>
        <StatusBadge status={b.status} />
        <span className="text-sm text-bone-dim">· reçue {b.created}</span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        {/* Projet + références */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface/40 p-6">
            <h2 className="font-serif text-lg text-bone">Le projet</h2>
            <dl className="mt-4 grid gap-4 sm:grid-cols-2">
              <Field label="Type">
                {b.projectType === "flash" ? "Flash" : "Personnalisé"}
              </Field>
              <Field label="Zone du corps">{b.body_zone}</Field>
              <Field label="Taille">{b.size}</Field>
              <Field label="Budget">{b.budget}</Field>
              <Field label="Disponibilité souhaitée">{b.preferredDate}</Field>
            </dl>
            {b.description && (
              <div className="mt-5">
                <p className="text-xs uppercase tracking-wider text-bone-dim">
                  Description
                </p>
                <p className="mt-1 text-sm leading-relaxed text-bone">
                  {b.description}
                </p>
              </div>
            )}
          </section>

          <section className="rounded-2xl border border-line bg-surface/40 p-6">
            <h2 className="flex items-center gap-2 font-serif text-lg text-bone">
              <Paperclip className="h-4 w-4 text-ink" /> Références ({b.references})
            </h2>
            {b.references > 0 ? (
              <div className="mt-4 grid grid-cols-3 gap-3 sm:grid-cols-4">
                {Array.from({ length: b.references }).map((_, i) => (
                  <div
                    key={i}
                    className={`aspect-square rounded-xl bg-gradient-to-br ${refGradients[i % refGradients.length]}`}
                  />
                ))}
              </div>
            ) : (
              <p className="mt-3 text-sm text-bone-dim">Aucune image jointe.</p>
            )}
          </section>
        </div>

        {/* Contact + actions */}
        <div className="space-y-6">
          <section className="rounded-2xl border border-line bg-surface/40 p-6">
            <h2 className="font-serif text-lg text-bone">Contact</h2>
            <div className="mt-4 space-y-2 text-sm">
              <a
                href={`mailto:${b.client_email}`}
                className="flex items-center gap-2 text-bone-dim transition-colors hover:text-bone"
              >
                <Mail className="h-4 w-4 shrink-0 text-ink" /> {b.client_email}
              </a>
              <a
                href={`tel:${b.client_phone.replace(/\s/g, "")}`}
                className="flex items-center gap-2 text-bone-dim transition-colors hover:text-bone"
              >
                <Phone className="h-4 w-4 shrink-0 text-ink" /> {b.client_phone}
              </a>
            </div>
          </section>

          <BookingActions bookingId={b.id} demo={!isSupabaseConfigured()} />
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wider text-bone-dim">{label}</dt>
      <dd className="mt-0.5 text-sm text-bone">{children}</dd>
    </div>
  );
}
