"use server";

import { redirect } from "next/navigation";
import { requireArtist } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/site";

// Onboarding Stripe Connect Express. Crée (si besoin) le compte connecté du
// tatoueur, enregistre son id, puis le redirige vers le formulaire d'onboarding
// hébergé par Stripe. Au retour : /dashboard/reglages?stripe=ok.
export async function connectStripeAccount(): Promise<void> {
  if (!isStripeConfigured()) {
    redirect("/dashboard/reglages?stripe=indispo");
  }

  const artist = await requireArtist();
  const stripe = getStripe();
  const site = getSiteUrl();

  const existing = artist.stripe_account_id;
  let accountId: string;

  if (existing) {
    accountId = existing;
  } else {
    const account = await stripe.accounts.create({
      type: "express",
      business_type: "individual",
      capabilities: {
        transfers: { requested: true },
        card_payments: { requested: true },
      },
      metadata: { artist_id: artist.id },
    });
    accountId = account.id;

    // L'artiste met à jour sa propre ligne (autorisé par la RLS owner).
    const supabase = await createClient();
    await supabase
      .from("artists")
      .update({ stripe_account_id: accountId })
      .eq("id", artist.id);
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${site}/dashboard/reglages?stripe=refresh`,
    return_url: `${site}/dashboard/reglages?stripe=ok`,
    type: "account_onboarding",
  });

  redirect(link.url);
}
