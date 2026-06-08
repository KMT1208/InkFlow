"use client";

import type { ReactNode } from "react";
import { useActionState } from "react";
import { CalendarPlus, Check, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestDeposit, type DepositRequestState } from "@/lib/actions/payments";
import {
  refuseBooking,
  scheduleAppointment,
  sendQuote,
  type InboxState,
} from "@/lib/actions/inbox";
import type { DemoBookingStatus } from "@/lib/demo";

export function BookingActions({
  bookingId,
  status,
}: {
  bookingId: string;
  status: DemoBookingStatus;
}) {
  if (status === "refusee" || status === "annulee") {
    return (
      <Note tone="muted">
        Cette demande a été {status === "refusee" ? "refusée" : "annulée"}.
      </Note>
    );
  }
  if (status === "terminee") {
    return <Note tone="success">Séance terminée. 🎉</Note>;
  }
  if (status === "confirmee") {
    return (
      <Note tone="success">
        Rendez-vous planifié et confirmé ✅ — les rappels partiront
        automatiquement avant la séance.
      </Note>
    );
  }
  if (status === "acompte_paye") {
    return (
      <section className="space-y-4 rounded-2xl border border-line bg-surface/40 p-6">
        <div>
          <h2 className="font-serif text-lg text-bone">Acompte payé ✅</h2>
          <p className="mt-1 text-sm text-bone-dim">
            Fixez la date de la séance pour confirmer et programmer les rappels.
          </p>
        </div>
        <ScheduleForm bookingId={bookingId} />
      </section>
    );
  }

  // nouvelle | devis_envoye | acompte_attendu
  return (
    <section className="space-y-5 rounded-2xl border border-line bg-surface/40 p-6">
      <h2 className="font-serif text-lg text-bone">Actions</h2>
      <QuoteForm bookingId={bookingId} />
      <div className="space-y-2 border-t border-line pt-5">
        <AcceptDepositButton bookingId={bookingId} />
        <RefuseButton bookingId={bookingId} />
      </div>
    </section>
  );
}

function QuoteForm({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<InboxState, FormData>(
    sendQuote.bind(null, bookingId),
    undefined,
  );
  if (state?.ok) return <Note tone="success">{state.message}</Note>;

  return (
    <form action={action}>
      <label
        htmlFor="quote"
        className="text-xs uppercase tracking-wider text-bone-dim"
      >
        Envoyer un devis
      </label>
      <div className="mt-1.5 flex gap-2">
        <div className="relative flex-1">
          <input
            id="quote"
            name="amount"
            type="number"
            min="0"
            step="1"
            placeholder="320"
            className="h-11 w-full rounded-lg border border-line bg-surface pl-3 pr-8 text-sm text-bone outline-none transition-colors focus:border-ink"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-bone-dim">
            €
          </span>
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={pending}
          className="h-11 shrink-0 px-4"
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <>
              <FileText className="mr-1.5 h-4 w-4" /> Envoyer
            </>
          )}
        </Button>
      </div>
      {state?.error && <p className="mt-2 text-sm text-ink">{state.error}</p>}
    </form>
  );
}

function AcceptDepositButton({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<DepositRequestState, FormData>(
    requestDeposit.bind(null, bookingId),
    undefined,
  );
  if (state?.ok) return <Note tone="success">{state.message}</Note>;

  return (
    <form action={action}>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi…
          </>
        ) : (
          <>
            <Check className="mr-1.5 h-4 w-4" /> Accepter et demander l&apos;acompte
          </>
        )}
      </Button>
      {state?.error && <p className="mt-2 text-sm text-ink">{state.error}</p>}
    </form>
  );
}

function RefuseButton({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<InboxState, FormData>(
    refuseBooking.bind(null, bookingId),
    undefined,
  );
  if (state?.ok) return <Note tone="muted">{state.message}</Note>;

  return (
    <form action={action}>
      <Button
        type="submit"
        variant="ghost"
        disabled={pending}
        className="w-full text-bone-dim hover:text-ink"
      >
        <X className="mr-1.5 h-4 w-4" /> Refuser
      </Button>
    </form>
  );
}

function ScheduleForm({ bookingId }: { bookingId: string }) {
  const [state, action, pending] = useActionState<InboxState, FormData>(
    scheduleAppointment.bind(null, bookingId),
    undefined,
  );
  if (state?.ok) return <Note tone="success">{state.message}</Note>;

  return (
    <form action={action} className="space-y-3">
      <div>
        <label
          htmlFor="date"
          className="text-xs uppercase tracking-wider text-bone-dim"
        >
          Date et heure
        </label>
        <input
          id="date"
          name="date"
          type="datetime-local"
          required
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-bone outline-none transition-colors focus:border-ink"
        />
      </div>
      <div>
        <label
          htmlFor="dur"
          className="text-xs uppercase tracking-wider text-bone-dim"
        >
          Durée
        </label>
        <select
          id="dur"
          name="durationMin"
          defaultValue="120"
          className="mt-1.5 h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-bone outline-none transition-colors focus:border-ink"
        >
          <option value="60">1 h</option>
          <option value="90">1 h 30</option>
          <option value="120">2 h</option>
          <option value="180">3 h</option>
          <option value="240">4 h</option>
          <option value="360">6 h</option>
        </select>
      </div>
      <Button type="submit" disabled={pending} className="w-full">
        {pending ? (
          <>
            <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Planification…
          </>
        ) : (
          <>
            <CalendarPlus className="mr-1.5 h-4 w-4" /> Planifier le rendez-vous
          </>
        )}
      </Button>
      {state?.error && <p className="text-sm text-ink">{state.error}</p>}
    </form>
  );
}

function Note({
  tone,
  children,
}: {
  tone: "success" | "muted";
  children: ReactNode;
}) {
  const cls =
    tone === "success"
      ? "border-emerald-500/30 bg-emerald-500/5 text-emerald-300"
      : "border-line bg-surface/40 text-bone-dim";
  return (
    <section className={`rounded-2xl border p-6 text-sm leading-relaxed ${cls}`}>
      {children}
    </section>
  );
}
