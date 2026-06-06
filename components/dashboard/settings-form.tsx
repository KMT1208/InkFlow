"use client";

import { useState, type ReactNode } from "react";
import { Check, CreditCard, ImagePlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { computeDepositCents, formatEur } from "@/lib/money";

const THEMES = [
  { id: "editorial", name: "Éditorial sombre", bg: "#0b0b0c", accent: "#e5302a" },
  { id: "charbon-or", name: "Charbon & or", bg: "#0b0b0c", accent: "#d4af37" },
  { id: "ivoire", name: "Ivoire", bg: "#f4f1ea", accent: "#1a1a1a" },
  { id: "encre-nuit", name: "Encre de nuit", bg: "#0a0f1f", accent: "#5b8cff" },
];

const DAYS = [
  { key: "mon", label: "Lundi" },
  { key: "tue", label: "Mardi" },
  { key: "wed", label: "Mercredi" },
  { key: "thu", label: "Jeudi" },
  { key: "fri", label: "Vendredi" },
  { key: "sat", label: "Samedi" },
  { key: "sun", label: "Dimanche" },
];

function SectionCard({
  title,
  desc,
  children,
}: {
  title: string;
  desc?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-line bg-surface/40 p-6">
      <h2 className="font-serif text-lg text-bone">{title}</h2>
      {desc && <p className="mt-1 text-sm text-bone-dim">{desc}</p>}
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Switch({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={onChange}
      className={cn(
        "relative h-6 w-11 shrink-0 rounded-full transition-colors",
        checked ? "bg-ink" : "bg-surface-2",
      )}
    >
      <span
        className={cn(
          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all",
          checked ? "left-[1.375rem]" : "left-0.5",
        )}
      />
    </button>
  );
}

export function SettingsForm() {
  const [theme, setTheme] = useState("editorial");
  const [depositType, setDepositType] = useState<"fixed" | "percent">("percent");
  const [depositValue, setDepositValue] = useState("30");
  const [refundable, setRefundable] = useState(false);
  const [stripeConnected, setStripeConnected] = useState(false);
  const [openDays, setOpenDays] = useState<Record<string, boolean>>({
    mon: false,
    tue: true,
    wed: true,
    thu: true,
    fri: true,
    sat: true,
    sun: false,
  });
  const [saved, setSaved] = useState(false);

  const val = Number(depositValue) || 0;
  const SAMPLE_TOTAL = 30_000; // 300 € en centimes
  const depositHint =
    depositType === "percent"
      ? `Exemple : sur un projet à ${formatEur(SAMPLE_TOTAL)}, l'acompte sera de ${formatEur(
          computeDepositCents(SAMPLE_TOTAL, "percent", val),
        )}.`
      : `Acompte fixe de ${formatEur(val * 100)} par réservation.`;

  return (
    <div className="space-y-6">
      {/* Profil */}
      <SectionCard title="Profil" desc="Ce que voient vos clients sur votre mini-site.">
        <div className="flex items-center gap-4">
          <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-ink/15 font-serif text-2xl text-ink">
            BL
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-lg border border-line px-3 py-2 text-sm text-bone-dim transition-colors hover:bg-surface-2 hover:text-bone"
          >
            <ImagePlus className="h-4 w-4" /> Changer la photo
          </button>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="displayName">Nom / blaze</Label>
            <Input id="displayName" defaultValue="Black Lotus" />
          </div>
          <div>
            <Label htmlFor="slug">Lien public</Label>
            <div className="flex items-center rounded-lg border border-line bg-surface focus-within:border-ink">
              <span className="pl-3 text-sm text-bone-dim">inkflow.app/</span>
              <input
                id="slug"
                defaultValue="black-lotus"
                className="h-11 w-full rounded-r-lg bg-transparent pl-1 pr-3 text-sm text-bone outline-none"
              />
            </div>
          </div>
        </div>

        <div className="mt-4">
          <Label htmlFor="bio">Bio</Label>
          <textarea
            id="bio"
            rows={3}
            defaultValue="Tatoueuse à Lyon — blackwork, fine line et compositions florales. Sur rendez-vous uniquement."
            className="w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-bone outline-none transition-colors focus:border-ink"
          />
        </div>

        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <Label htmlFor="city">Ville</Label>
            <Input id="city" defaultValue="Lyon" />
          </div>
          <div>
            <Label htmlFor="instagram">Instagram</Label>
            <Input id="instagram" defaultValue="blacklotus.ink" />
          </div>
          <div>
            <Label htmlFor="website">Site web</Label>
            <Input id="website" placeholder="https://" />
          </div>
        </div>
      </SectionCard>

      {/* Thème */}
      <SectionCard title="Thème du mini-site" desc="L'ambiance de votre page publique.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTheme(t.id)}
              className={cn(
                "rounded-xl border p-3 text-left transition-colors",
                theme === t.id ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/40",
              )}
            >
              <div className="flex gap-1.5">
                <span
                  className="h-8 w-full rounded-md"
                  style={{ backgroundColor: t.bg }}
                />
                <span
                  className="h-8 w-3 rounded-md"
                  style={{ backgroundColor: t.accent }}
                />
              </div>
              <p className="mt-2 text-xs text-bone">{t.name}</p>
            </button>
          ))}
        </div>
      </SectionCard>

      {/* Acompte */}
      <SectionCard
        title="Acompte"
        desc="Demandé au client avant de confirmer le rendez-vous."
      >
        <div className="flex flex-wrap items-end gap-4">
          <div>
            <Label>Type</Label>
            <div className="flex rounded-lg border border-line p-1">
              {(["percent", "fixed"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setDepositType(t)}
                  className={cn(
                    "rounded-md px-4 py-1.5 text-sm transition-colors",
                    depositType === t
                      ? "bg-ink text-white"
                      : "text-bone-dim hover:text-bone",
                  )}
                >
                  {t === "percent" ? "Pourcentage" : "Montant fixe"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label htmlFor="depositValue">
              {depositType === "percent" ? "Valeur (%)" : "Valeur (€)"}
            </Label>
            <div className="relative w-32">
              <Input
                id="depositValue"
                type="number"
                min="0"
                value={depositValue}
                onChange={(e) => setDepositValue(e.target.value)}
                className="pr-8"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-bone-dim">
                {depositType === "percent" ? "%" : "€"}
              </span>
            </div>
          </div>

          <label className="flex items-center gap-2 pb-2.5 text-sm text-bone-dim">
            <Switch
              checked={refundable}
              onChange={() => setRefundable((v) => !v)}
              label="Remboursable"
            />
            Remboursable
          </label>
        </div>
        <p className="mt-4 rounded-lg border border-line bg-noir/40 p-3 text-sm text-bone-dim">
          {depositHint}
        </p>
      </SectionCard>

      {/* Stripe */}
      <SectionCard
        title="Paiements"
        desc="Recevez les acomptes directement sur votre compte."
      >
        {stripeConnected ? (
          <div className="flex items-center gap-3 rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-4">
            <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-500/15 text-emerald-400">
              <Check className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-medium text-bone">Compte Stripe connecté</p>
              <p className="text-xs text-bone-dim">
                Les acomptes sont reversés automatiquement.
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-line bg-noir/40 p-4">
            <p className="text-sm text-bone-dim">
              Connectez Stripe pour encaisser les acomptes (Stripe Connect Express).
            </p>
            <Button type="button" onClick={() => setStripeConnected(true)}>
              <CreditCard className="mr-1.5 h-4 w-4" /> Connecter Stripe
            </Button>
          </div>
        )}
      </SectionCard>

      {/* Disponibilités */}
      <SectionCard
        title="Disponibilités"
        desc="Vos créneaux d'ouverture par défaut, chaque semaine."
      >
        <div className="space-y-2">
          {DAYS.map((d) => {
            const open = openDays[d.key];
            return (
              <div
                key={d.key}
                className="flex items-center gap-4 rounded-lg border border-line bg-noir/30 px-4 py-3"
              >
                <div className="flex w-32 items-center gap-3">
                  <Switch
                    checked={open}
                    onChange={() =>
                      setOpenDays((s) => ({ ...s, [d.key]: !s[d.key] }))
                    }
                    label={d.label}
                  />
                  <span className={cn("text-sm", open ? "text-bone" : "text-bone-dim")}>
                    {d.label}
                  </span>
                </div>
                {open ? (
                  <div className="flex items-center gap-2 text-sm text-bone-dim">
                    <input
                      type="time"
                      defaultValue="11:00"
                      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-bone [color-scheme:dark] outline-none focus:border-ink"
                    />
                    <span>→</span>
                    <input
                      type="time"
                      defaultValue="19:00"
                      className="rounded-lg border border-line bg-surface px-2 py-1.5 text-bone [color-scheme:dark] outline-none focus:border-ink"
                    />
                  </div>
                ) : (
                  <span className="text-sm text-bone-dim">Fermé</span>
                )}
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Barre d'enregistrement */}
      <div className="flex items-center justify-end gap-3">
        {saved && (
          <span className="inline-flex items-center gap-1 text-sm text-emerald-400">
            <Check className="h-4 w-4" /> Modifications enregistrées (démo)
          </span>
        )}
        <Button type="button" onClick={() => setSaved(true)} className="px-6">
          Enregistrer les modifications
        </Button>
      </div>
    </div>
  );
}
