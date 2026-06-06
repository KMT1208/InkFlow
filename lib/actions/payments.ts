"use server";

import { redirect } from "next/navigation";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { computeDepositCents, type DepositType } from "@/lib/money";

export type CheckoutState = { error: string } | undefined;

// Crée une session de paiement Stripe Checkout pour l'ACOMPTE d'une demande,
// en *destination charge* vers le compte connecté du tatoueur (Stripe Connect).
// Redirige le client vers la page de paiement Stripe en cas de succès.
//
// ⚠️ Joignable en POST direct → toutes les données viennent de la base (via le
// client service-role), jamais du client. À appeler une fois le devis fixé.
export async function createDepositCheckout(bookingId: string): Promise<CheckoutState> {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return { error: "Les paiements ne sont pas encore configurés (Supabase + Stripe requis)." };
  }

  const admin = createAdminClient();

  const { data: booking, error: bookingErr } = await admin
    .from("booking_requests")
    .select("id, artist_id, quote_amount, client_email, status")
    .eq("id", bookingId)
    .single();
  if (bookingErr || !booking) {
    return { error: "Demande introuvable." };
  }

  const { data: artist, error: artistErr } = await admin
    .from("artists")
    .select("id, slug, display_name, currency, stripe_account_id, deposit_type, deposit_value")
    .eq("id", booking.artist_id)
    .single();
  if (artistErr || !artist) {
    return { error: "Studio introuvable." };
  }
  if (!artist.stripe_account_id) {
    return { error: "Le studio n'a pas encore connecté son compte Stripe." };
  }

  // Le total provient du devis. L'acompte est calculé selon la config du studio.
  const totalCents: number = booking.quote_amount ?? 0;
  if (totalCents <= 0) {
    return { error: "Aucun montant de devis n'a encore été fixé." };
  }
  const depositCents = computeDepositCents(
    totalCents,
    artist.deposit_type as DepositType,
    artist.deposit_value as number,
  );
  if (depositCents <= 0) {
    return { error: "Le montant de l'acompte est invalide." };
  }

  const stripe = getStripe();
  const site = getSiteUrl();

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    customer_email: booking.client_email ?? undefined,
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: (artist.currency as string) || "eur",
          unit_amount: depositCents,
          product_data: { name: `Acompte — ${artist.display_name}` },
        },
      },
    ],
    payment_intent_data: {
      // Destination charge : l'acompte est reversé au compte connecté du studio.
      transfer_data: { destination: artist.stripe_account_id as string },
    },
    metadata: {
      booking_id: booking.id as string,
      artist_id: artist.id as string,
      kind: "deposit",
    },
    success_url: `${site}/${artist.slug}?paiement=ok`,
    cancel_url: `${site}/${artist.slug}?paiement=annule`,
  });

  if (!session.url) {
    return { error: "Impossible de créer la session de paiement." };
  }

  redirect(session.url);
}
