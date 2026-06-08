"use client";

import { useActionState, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { FieldError, Input, Label } from "@/components/ui/input";
import {
  createFlash,
  deleteFlash,
  toggleFlashAvailability,
  type FlashState,
} from "@/lib/actions/flash";
import type { FlashItem } from "@/lib/flash-data";

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

export function FlashManager({
  flash,
  demo,
}: {
  flash: FlashItem[];
  demo: boolean;
}) {
  const [adding, setAdding] = useState(false);

  return (
    <div className="space-y-6">
      {demo && (
        <p className="rounded-xl border border-line bg-surface/40 px-4 py-3 text-sm text-bone-dim">
          Aperçu de démonstration — une fois connecté, vous gérez ici vos vrais
          flashs.
        </p>
      )}

      {adding ? (
        <AddFlashForm onClose={() => setAdding(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="flex w-full items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface/30 px-6 py-5 text-bone-dim transition-colors hover:border-ink/50 hover:text-bone"
        >
          <span className="grid h-9 w-9 place-items-center rounded-full bg-ink/10 text-ink">
            <Plus className="h-5 w-5" />
          </span>
          <span className="text-sm font-medium">Ajouter un flash</span>
        </button>
      )}

      {flash.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-line bg-surface/20 px-6 py-10 text-center text-sm text-bone-dim">
          Aucun flash pour l&apos;instant. Cliquez sur «&nbsp;Ajouter un
          flash&nbsp;» pour créer le premier.
        </p>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {flash.map((f, i) => (
            <FlashCard key={f.id} flash={f} index={i} />
          ))}
        </div>
      )}
    </div>
  );
}

function FlashCard({ flash: f, index }: { flash: FlashItem; index: number }) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-line bg-surface/40 transition-opacity",
        !f.isAvailable && "opacity-60",
      )}
    >
      <div
        className={`relative aspect-[4/5] bg-gradient-to-br ${gradients[index % gradients.length]}`}
      >
        {f.imageUrl && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={f.imageUrl}
            alt={f.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        {f.size && (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-noir/60 px-2 py-1 text-xs text-bone backdrop-blur">
            {f.size}
          </span>
        )}
        <form
          action={deleteFlash.bind(null, f.id)}
          className="absolute right-2 top-2 z-10"
        >
          <button
            type="submit"
            aria-label="Supprimer ce flash"
            className="grid h-8 w-8 place-items-center rounded-lg bg-noir/60 text-bone backdrop-blur transition-colors hover:text-ink"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </form>
        {!f.imageUrl && (
          <span className="absolute bottom-3 left-3 font-serif text-xl text-bone/90">
            {f.title}
          </span>
        )}
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
          <form action={toggleFlashAvailability.bind(null, f.id, !f.isAvailable)}>
            <button
              type="submit"
              role="switch"
              aria-checked={f.isAvailable}
              aria-label="Réservable"
              className={cn(
                "relative block h-6 w-11 rounded-full transition-colors",
                f.isAvailable ? "bg-ink" : "bg-surface-2",
              )}
            >
              <span
                className={cn(
                  "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
                  f.isAvailable ? "left-[1.375rem]" : "left-0.5",
                )}
              />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function AddFlashForm({ onClose }: { onClose: () => void }) {
  const [state, action, pending] = useActionState<FlashState, FormData>(
    createFlash,
    undefined,
  );

  return (
    <form
      action={action}
      className="space-y-4 rounded-2xl border border-line bg-surface/40 p-6"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-serif text-lg text-bone">Nouveau flash</h3>
        <button
          type="button"
          onClick={onClose}
          className="text-sm text-bone-dim transition-colors hover:text-bone"
        >
          Fermer
        </button>
      </div>

      {state?.ok && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
          Flash ajouté ✅ — il apparaît dans la galerie ci-dessous.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="f-title">Titre</Label>
          <Input id="f-title" name="title" placeholder="Serpent & pivoine" />
          <FieldError messages={state?.fieldErrors?.title} />
        </div>
        <div>
          <Label htmlFor="f-price">Prix (€) — optionnel</Label>
          <Input
            id="f-price"
            name="price"
            type="number"
            min="0"
            step="1"
            placeholder="180"
          />
        </div>
        <div>
          <Label htmlFor="f-size">Taille — optionnel</Label>
          <Input id="f-size" name="size" placeholder="15 cm" />
        </div>
        <div>
          <Label htmlFor="f-placements">Emplacements — optionnel</Label>
          <Input
            id="f-placements"
            name="placements"
            placeholder="avant-bras, mollet"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="f-image">Photo — optionnel</Label>
        <input
          id="f-image"
          name="image"
          type="file"
          accept="image/*"
          className="block w-full text-sm text-bone-dim file:mr-3 file:cursor-pointer file:rounded-full file:border-0 file:bg-surface-2 file:px-4 file:py-2 file:text-sm file:text-bone hover:file:bg-line"
        />
        <p className="mt-1 text-xs text-bone-dim">
          Laissez vide si vous voulez : une vignette colorée s&apos;affichera à
          la place.
        </p>
      </div>

      <label className="flex items-center gap-2 text-sm text-bone-dim">
        <input
          type="checkbox"
          name="isAvailable"
          defaultChecked
          className="h-4 w-4 accent-ink"
        />
        Réservable immédiatement
      </label>

      {state?.error && <p className="text-sm text-ink">{state.error}</p>}

      <Button type="submit" disabled={pending}>
        {pending ? "Ajout…" : "Ajouter le flash"}
      </Button>
    </form>
  );
}
