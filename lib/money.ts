// Logique monétaire. Tout est en CENTIMES (entiers) — jamais de float pour l'argent.

export type DepositType = "fixed" | "percent";

/**
 * Calcule l'acompte en CENTIMES à partir du total (centimes) et de la config.
 * - "fixed"   : `value` est un montant en centimes, plafonné au total.
 * - "percent" : `value` est un pourcentage 0–100, arrondi au centime.
 * Toute entrée invalide (NaN, négative) est ramenée à 0 / bornée.
 */
export function computeDepositCents(
  totalCents: number,
  type: DepositType,
  value: number,
): number {
  if (!Number.isFinite(totalCents) || totalCents <= 0) return 0;
  if (!Number.isFinite(value)) return 0;

  if (type === "fixed") {
    const fixed = Math.round(value);
    return Math.min(Math.max(0, fixed), totalCents);
  }

  const pct = Math.min(100, Math.max(0, value));
  return Math.round((totalCents * pct) / 100);
}

/** Formate des centimes en euros (fr-FR). Ex. 9000 → "90,00 €". */
export function formatEur(cents: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format((Number.isFinite(cents) ? cents : 0) / 100);
}
