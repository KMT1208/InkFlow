"use client";

import { useActionState, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import { submitBookingRequest, type BookingState } from "@/lib/actions/booking";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { PublicFlash } from "@/lib/demo";

const STEPS = ["Projet", "Détails", "Coordonnées"];

export function BookingForm({
  slug,
  flash,
}: {
  slug: string;
  flash: PublicFlash[];
}) {
  const [state, action, pending] = useActionState<BookingState, FormData>(
    submitBookingRequest,
    undefined,
  );
  const [step, setStep] = useState(0);
  const [projectType, setProjectType] = useState<"flash" | "custom">("custom");

  if (state?.ok) {
    return <SuccessCard demo={!!state.demo} />;
  }

  return (
    <form
      action={action}
      className="rounded-2xl border border-line bg-surface/40 p-6 sm:p-8"
    >
      <input type="hidden" name="slug" value={slug} />

      <ol className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        {STEPS.map((label, i) => (
          <li key={label} className="flex items-center gap-2">
            <span
              className={cn(
                "grid h-6 w-6 place-items-center rounded-full text-[11px]",
                i <= step ? "bg-ink text-white" : "bg-surface-2 text-bone-dim",
              )}
            >
              {i + 1}
            </span>
            <span className={i === step ? "text-bone" : "text-bone-dim"}>
              {label}
            </span>
            {i < STEPS.length - 1 && <span className="mx-1 h-px w-6 bg-line" />}
          </li>
        ))}
      </ol>

      {/* Étape 1 — Projet */}
      <div className={step === 0 ? "space-y-4" : "hidden"}>
        <div>
          <Label>Type de projet</Label>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["flash", "custom"] as const).map((t) => (
              <label
                key={t}
                className={cn(
                  "cursor-pointer rounded-xl border p-4 text-sm transition-colors",
                  projectType === t
                    ? "border-ink bg-ink/10 text-bone"
                    : "border-line text-bone-dim hover:border-ink/40",
                )}
              >
                <input
                  type="radio"
                  name="projectType"
                  value={t}
                  checked={projectType === t}
                  onChange={() => setProjectType(t)}
                  className="sr-only"
                />
                <span className="block font-medium">
                  {t === "flash" ? "Réserver un flash" : "Projet personnalisé"}
                </span>
                <span className="mt-1 block text-xs text-bone-dim">
                  {t === "flash"
                    ? "Un de mes dessins disponibles"
                    : "Une idée à créer ensemble"}
                </span>
              </label>
            ))}
          </div>
        </div>

        {projectType === "flash" ? (
          <div>
            <Label htmlFor="flashId">Quel flash ?</Label>
            <select
              id="flashId"
              name="flashId"
              className="h-11 w-full rounded-lg border border-line bg-surface px-3 text-sm text-bone outline-none focus:border-ink"
            >
              <option value="">— choisir —</option>
              {flash.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.title}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <div>
            <Label htmlFor="description">Décris ton idée</Label>
            <textarea
              id="description"
              name="description"
              rows={4}
              placeholder="Style, motif, inspirations, signification…"
              className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-bone outline-none transition-colors placeholder:text-bone-dim/50 focus:border-ink"
            />
          </div>
        )}
      </div>

      {/* Étape 2 — Détails */}
      <div className={step === 1 ? "space-y-4" : "hidden"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="bodyZone">Zone du corps</Label>
            <Input id="bodyZone" name="bodyZone" placeholder="avant-bras, dos…" />
          </div>
          <div>
            <Label htmlFor="size">Taille approximative</Label>
            <Input id="size" name="size" placeholder="10 cm" />
          </div>
        </div>
        <div>
          <Label htmlFor="budget">Budget indicatif</Label>
          <Input id="budget" name="budget" placeholder="200–300 €" />
        </div>
        <div>
          <Label htmlFor="references">Images de référence</Label>
          <input
            id="references"
            name="references"
            type="file"
            multiple
            accept="image/*"
            className="block w-full text-sm text-bone-dim file:mr-3 file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:text-bone hover:file:bg-line"
          />
        </div>
        <div>
          <Label htmlFor="preferredDate">Disponibilité souhaitée</Label>
          <Input
            id="preferredDate"
            name="preferredDate"
            placeholder="ex. samedis, courant juin…"
          />
        </div>
      </div>

      {/* Étape 3 — Coordonnées */}
      <div className={step === 2 ? "space-y-4" : "hidden"}>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="clientName">Nom</Label>
            <Input id="clientName" name="clientName" />
            <FieldError messages={state?.fieldErrors?.clientName} />
          </div>
          <div>
            <Label htmlFor="clientPhone">Téléphone</Label>
            <Input id="clientPhone" name="clientPhone" type="tel" />
          </div>
        </div>
        <div>
          <Label htmlFor="clientEmail">Email</Label>
          <Input id="clientEmail" name="clientEmail" type="email" />
          <FieldError messages={state?.fieldErrors?.clientEmail} />
        </div>
        <label className="flex items-start gap-3 text-sm text-bone-dim">
          <input
            type="checkbox"
            name="consent"
            className="mt-1 h-4 w-4 accent-ink"
          />
          <span>
            Je certifie être majeur·e et sans contre-indication médicale, et
            j&apos;accepte d&apos;être recontacté·e au sujet de ma demande.
          </span>
        </label>
        <FieldError messages={state?.fieldErrors?.consent} />
      </div>

      {state?.error && <p className="mt-4 text-sm text-ink">{state.error}</p>}

      <div className="mt-6 flex items-center justify-between">
        <button
          type="button"
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          className={cn(
            "text-sm text-bone-dim transition-colors hover:text-bone",
            step === 0 && "invisible",
          )}
        >
          ← Précédent
        </button>
        {step < 2 ? (
          <Button type="button" onClick={() => setStep((s) => Math.min(2, s + 1))}>
            Suivant
          </Button>
        ) : (
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Envoi…
              </>
            ) : (
              "Envoyer ma demande"
            )}
          </Button>
        )}
      </div>
    </form>
  );
}

function SuccessCard({ demo }: { demo: boolean }) {
  return (
    <div className="rounded-2xl border border-emerald-500/30 bg-emerald-500/5 p-8 text-center">
      <div className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
        <Check className="h-6 w-6" />
      </div>
      <h3 className="mt-4 font-serif text-2xl text-bone">Demande envoyée !</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-bone-dim">
        Le studio va étudier ta demande et te recontacter.{" "}
        {demo
          ? "(Démo : en réel, tu passerais maintenant au paiement de l'acompte pour confirmer le créneau.)"
          : "Tu vas recevoir un email de confirmation."}
      </p>
    </div>
  );
}
