import "server-only";
import Stripe from "stripe";

// Client Stripe (plateforme). Server-only. La clé secrète n'est jamais exposée.
let cached: Stripe | null = null;

export function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    throw new Error("STRIPE_SECRET_KEY manquant — Stripe n'est pas configuré.");
  }
  if (!cached) {
    cached = new Stripe(key, { typescript: true });
  }
  return cached;
}

export function isStripeConfigured(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}
