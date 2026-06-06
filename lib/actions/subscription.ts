"use server";

import { redirect } from "next/navigation";
import { requireArtist } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site";
import { PLAN_PRICE_ENV, TRIAL_DAYS, type PlanId } from "@/lib/plans";

// Abonnement du tatoueur au SaaS (Stripe Checkout en mode subscription, avec
// essai). Crée le customer Stripe au besoin, puis redirige vers le paiement.
export async function startSubscriptionCheckout(plan: PlanId): Promise<void> {
  if (!isStripeConfigured()) redirect("/dashboard/reglages?abo=indispo");

  const priceId = process.env[PLAN_PRICE_ENV[plan]];
  if (!priceId) redirect("/dashboard/reglages?abo=config");

  const artist = await requireArtist();
  const stripe = getStripe();
  const site = getSiteUrl();

  const existing = artist.stripe_customer_id;
  let customerId: string;
  if (existing) {
    customerId = existing;
  } else {
    const customer = await stripe.customers.create({
      name: artist.display_name,
      metadata: { artist_id: artist.id },
    });
    customerId = customer.id;
    const supabase = await createClient();
    await supabase
      .from("artists")
      .update({ stripe_customer_id: customerId })
      .eq("id", artist.id);
  }

  const session = await stripe.checkout.sessions.create({
    mode: "subscription",
    customer: customerId,
    line_items: [{ price: priceId, quantity: 1 }],
    subscription_data: {
      trial_period_days: TRIAL_DAYS,
      metadata: { artist_id: artist.id, plan },
    },
    metadata: { artist_id: artist.id, plan },
    success_url: `${site}/dashboard/reglages?abo=ok`,
    cancel_url: `${site}/dashboard/reglages?abo=annule`,
  });

  if (!session.url) redirect("/dashboard/reglages?abo=erreur");
  redirect(session.url);
}

// Ouvre le portail de facturation Stripe (gérer / annuler l'abonnement).
export async function openBillingPortal(): Promise<void> {
  if (!isStripeConfigured()) redirect("/dashboard/reglages?abo=indispo");

  const artist = await requireArtist();
  if (!artist.stripe_customer_id) redirect("/dashboard/reglages?abo=aucun");

  const stripe = getStripe();
  const site = getSiteUrl();
  const portal = await stripe.billingPortal.sessions.create({
    customer: artist.stripe_customer_id,
    return_url: `${site}/dashboard/reglages`,
  });

  redirect(portal.url);
}
