"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { PublicFlash } from "@/lib/demo";

const gradients = [
  "from-ink/30 via-noir to-noir",
  "from-amber-500/20 via-noir to-noir",
  "from-violet-500/20 via-noir to-noir",
  "from-emerald-500/15 via-noir to-noir",
  "from-rose-500/20 via-noir to-noir",
  "from-sky-500/15 via-noir to-noir",
];

const eur = (cents: number) =>
  new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);

export function FlashManager({ flash }: { flash: PublicFlash[] }) {
  // Disponibilité locale (démo) : le dernier flash est indisponible par défaut.
  const [available, setAvailable] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(flash.map((f, i) => [f.id, i !== flash.length - 1])),
  );

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {/* Carte d'ajout / drop zone */}
      <button
        type="button"
        className="flex min-h-[300px] flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface/30 text-bone-dim transition-colors hover:border-ink/50 hover:text-bone"
      >
        <span className="grid h-12 w-12 place-items-center rounded-full bg-ink/10 text-ink">
          <Plus className="h-6 w-6" />
        </span>
        <span className="text-sm font-medium">Ajouter un flash</span>
        <span className="text-xs">ou glissez vos images ici</span>
      </button>

      {flash.map((f, i) => {
        const isOn = available[f.id];
        return (
          <div
            key={f.id}
            className={cn(
              "overflow-hidden rounded-2xl border border-line bg-surface/40 transition-opacity",
              !isOn && "opacity-60",
            )}
          >
            <div
              className={`relative aspect-[4/5] bg-gradient-to-br ${gradients[i % gradients.length]}`}
            >
              {f.size && (
                <span className="absolute left-3 top-3 rounded-full bg-noir/60 px-2 py-1 text-xs text-bone backdrop-blur">
                  {f.size}
                </span>
              )}
              <div className="absolute right-2 top-2 flex gap-1">
                <button
                  type="button"
                  aria-label="Modifier"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-noir/60 text-bone backdrop-blur transition-colors hover:bg-noir"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  aria-label="Supprimer"
                  className="grid h-8 w-8 place-items-center rounded-lg bg-noir/60 text-bone backdrop-blur transition-colors hover:text-ink"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
              <span className="absolute bottom-3 left-3 font-serif text-xl text-bone/90">
                {f.title}
              </span>
            </div>

            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-serif text-lg text-bone">{f.title}</h3>
                {f.price != null && (
                  <span className="shrink-0 font-medium text-bone">{eur(f.price)}</span>
                )}
              </div>
              {f.placements.length > 0 && (
                <p className="mt-1 text-xs text-bone-dim">{f.placements.join(" · ")}</p>
              )}

              <div className="mt-4 flex items-center justify-between border-t border-line pt-3">
                <span className="text-sm text-bone-dim">Réservable</span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isOn}
                  aria-label="Réservable"
                  onClick={() =>
                    setAvailable((s) => ({ ...s, [f.id]: !s[f.id] }))
                  }
                  className={cn(
                    "relative h-6 w-11 rounded-full transition-colors",
                    isOn ? "bg-ink" : "bg-surface-2",
                  )}
                >
                  <span
                    className={cn(
                      "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                      isOn ? "left-[1.375rem]" : "left-0.5",
                    )}
                  />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
