"use client";

import { useState } from "react";
import { Check, FileText, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BookingActions() {
  const [amount, setAmount] = useState("");
  const [result, setResult] = useState<string | null>(null);

  if (result) {
    return (
      <section className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-6">
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="h-5 w-5 shrink-0" />
          <span className="text-sm font-medium">{result}</span>
        </div>
        <button
          type="button"
          onClick={() => setResult(null)}
          className="mt-4 text-sm text-bone-dim transition-colors hover:text-bone"
        >
          ← Revenir aux actions
        </button>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-line bg-surface/40 p-6">
      <h2 className="font-serif text-lg text-bone">Actions</h2>

      <div className="mt-4">
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
            onClick={() => amount && setResult(`Devis de ${amount} € envoyé au client.`)}
            className="h-11 shrink-0 px-4"
          >
            <FileText className="mr-1.5 h-4 w-4" /> Envoyer
          </Button>
        </div>
      </div>

      <div className="mt-5 space-y-2 border-t border-line pt-5">
        <Button
          type="button"
          onClick={() =>
            setResult("Demande acceptée — lien d'acompte envoyé au client.")
          }
          className="w-full"
        >
          <Check className="mr-1.5 h-4 w-4" /> Accepter et demander l&apos;acompte
        </Button>
        <Button
          type="button"
          variant="ghost"
          onClick={() => setResult("Demande refusée.")}
          className="w-full text-bone-dim hover:text-ink"
        >
          <X className="mr-1.5 h-4 w-4" /> Refuser
        </Button>
      </div>
    </section>
  );
}
