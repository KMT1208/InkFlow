// Plans d'abonnement SaaS (côté plateforme, Stripe Billing).
export type PlanId = "solo" | "studio";

// Nom de la variable d'env contenant le price_id Stripe de chaque plan.
export const PLAN_PRICE_ENV: Record<PlanId, string> = {
  solo: "STRIPE_PRICE_SOLO",
  studio: "STRIPE_PRICE_STUDIO",
};

export const PLANS: Record<PlanId, { name: string; priceLabel: string }> = {
  solo: { name: "Solo", priceLabel: "19 €/mois" },
  studio: { name: "Studio", priceLabel: "39 €/mois" },
};

export const TRIAL_DAYS = 14;
