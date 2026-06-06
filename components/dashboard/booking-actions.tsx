"use client";

import { useActionState, useState } from "react";
import { Check, FileText, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { requestDeposit, type DepositRequestState } from "@/lib/actions/payments";

export function BookingActions({
  bookingId,
  demo,
}: {
  bookingId: string;
  demo: boolean;
}) {
  const [amount, setAmount] = useState("");
  const [localResult, setLocalResult] = useState<string | null>(null);
  const [depState, depAction, depPending] = useActionState<DepositRequestState, FormData>(
    requestDeposit.bind(null, bookingId),
    undefined,
  );

  const success = localResult ?? (depState?.ok ? (depState.message ?? null) : null);

  if (success) {
    return (
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{success}</span>
        </div>
        {demo && (
          <button
            type="button"
            onClick={() => setLocalResult(null)}
            className="mt-4 text-sm text-bone-dim transition-colors hover:text-bone"
          >
            ← Revenir aux actions
          </button>
        )}
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-surface/40 p-6">
      <h2 className="font-serif text-lg text-bone">Actions</h2>

      <div className="mt-4">
        <label htmlFor="quote" className="text-xs uppercase tracking-wider text-bone-dim">
          Envoyer un devis
        </label>
        <div className="mt-1.5 flex gap-2">
          <div className="relative flex-1">
            <input
              id="quote"
              type="number"
              min="0"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="320"
              className="h-11 w-full rounded-lg border border-line bg-surface pl-3 pr-8 text-sm text-bone outline-none transition-colors focus:border-ink"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-bone-dim">
              €
            </span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={() => amount && setLocalResult(`Devis de ${amount} € envoyé au client.`)}
            className="h-11 shrink-0 px-4"
          >
            <FileText className="mr-1.5 h-4 w-4" /> Envoyer
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-5">
        {demo ? (
          <Button
            type="button"
            onClick={() =>
              setLocalResult("Demande acceptée — lien d'acompte envoyé au client.")
            }
            className="w-full"
          >
            <Check className="mr-1.5 h-4 w-4" /> Accepter et demander l&apos;acompte
          </Button>
        ) : (
          <form action={depAction}>
            <Button type="submit" disabled={depPending} className="w-full">
              {depPending ? (
                <>
                  <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> Envoi…
                </>
              ) : (
                <>
                  <Check className="mr-1.5 h-4 w-4" /> Accepter et demander l&apos;acompte
                </>
              )}
            </Button>
          </form>
        )}
        <Button
          type="button"
          variant="ghost"
          onClick={() => setLocalResult("Demande refusée.")}
          className="w-full text-bone-dim hover:text-ink"
        >
          <X className="mr-1.5 h-4 w-4" /> Refuser
        </Button>
      </div>

      {depState?.error && <p className="mt-4 text-sm text-ink">{depState.error}</p>}
    </section>
  );
}
