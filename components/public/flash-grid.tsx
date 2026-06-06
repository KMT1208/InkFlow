import { buttonClass } from "@/components/ui/button";
import type { PublicFlash } from "@/lib/demo";

const gradients = [
  "from-ink/30 via-noir to-noir",
  "from-amber-500/20 via-noir to-noir",
  "from-violet-500/20 via-noir to-noir",
  "from-emerald-500/15 via-noir to-noir",
  "from-rose-500/20 via-noir to-noir",
  "from-sky-500/15 via-noir to-noir",
];

function formatPrice(cents: number, currency: string) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency.toUpperCase(),
    maximumFractionDigits: 0,
  }).format(cents / 100);
}

export function FlashGrid({
  flash,
  currency,
}: {
  flash: PublicFlash[];
  currency: string;
}) {
  if (flash.length === 0) {
    return (
      <p className="text-sm text-bone-dim">
        Aucun flash disponible pour le moment — décrivez votre projet ci-dessous.
      </p>
    );
  }

  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {flash.map((f, i) => (
        <div
          key={f.id}
          className="group overflow-hidden rounded-2xl border border-line bg-surface/40 transition-colors hover:border-ink/40"
        >
          <div
            className={`relative aspect-[4/5] bg-gradient-to-br ${gradients[i % gradients.length]}`}
          >
            {f.size && (
              <span className="absolute left-3 top-3 rounded-full bg-noir/60 px-2 py-1 text-xs text-bone backdrop-blur">
                {f.size}
              </span>
            )}
            <span className="absolute bottom-3 left-3 font-serif text-xl text-bone/90">
              {f.title}
            </span>
          </div>
          <div className="p-4">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-serif text-lg text-bone">{f.title}</h3>
              {f.price != null && (
                <span className="shrink-0 font-medium text-bone">
                  {formatPrice(f.price, currency)}
                </span>
              )}
            </div>
            {f.placements.length > 0 && (
              <p className="mt-1 text-xs text-bone-dim">{f.placements.join(" · ")}</p>
            )}
            <a
              href="#reserver"
              className={buttonClass("outline", "mt-4 h-10 w-full text-sm")}
            >
              Réserver ce flash
            </a>
          </div>
        </div>
      ))}
    </div>
  );
}
