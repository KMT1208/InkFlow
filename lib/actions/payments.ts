"use server";

import { redirect } from "next/navigation";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getSiteUrl } from "@/lib/site";
import { computeDepositCents, formatEur, type DepositType } from "@/lib/money";
import { sendDepositRequest } from "@/lib/email";

export type CheckoutState = { error: string } | undefined;
export type DepositRequestState =
  | { ok?: boolean; message?: string; error?: string }
  | undefined;

type DepositSession = {
  url: string;
  clientEmail: string | null;
  studioName: string;
  amountLabel: string;
};

// Construit une session Stripe Checkout pour l'acompte d'une demande, en
// *destination charge* vers le compte connecté du tatoueur. Toutes les données
// viennent de la base (service-role), jamais du client.
async function buildDepositSession(
  bookingId: string,
): Promise<DepositSession | { error: string }> {
  if (!isSupabaseConfigured() || !isStripeConfigured()) {
    return { error: "Paiements non configurés (Supabase + Stripe requis)." };
  }

  const admin = createAdminClient();

  const { data: booking, error: bookingErr } = await admin
    .from("booking_requests")
    .select("id, artist_id, quote_amount, client_email")
    .eq("id", bookingId)
    .single();
  if (bookingErr || !booking) return { error: "Demande introuvable." };

  const { data: artist, error: artistErr } = await admin
    .from("artists")
    .select("id, slug, display_name, currency, stripe_account_id, deposit_type, deposit_value")
    .eq("id", booking.artist_id)
    .single();
  if (artistErr || !artist) return { error: "Studio introuvable." };
  if (!artist.stripe_account_id) {
    return { error: "Le studio n'a pas encore connecté son compte Stripe." };
  }

  const totalCents: number = booking.quote_amount ?? 0;
  if (totalCents <= 0) return { error: "Aucun montant de devis n'a été fixé." };

  const depositCents = computeDepositCents(
    totalCents,
    artist.deposit_type as DepositType,
    artist.deposit_value as number,
  );
  if (depositCents <= 0) return { error: "Montant d'acompte invalide." };

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

  if (!session.url) return { error: "Impossible de créer la session de paiement." };

  return {
    url: session.url,
    clientEmail: (booking.client_email as string | null) ?? null,
    studioName: artist.display_name as string,
    amountLabel: formatEur(depositCents),
  };
}

// Côté CLIENT : redirige directement vers le paiement de l'acompte.
export async function createDepositCheckout(bookingId: string): Promise<CheckoutState> {
  const result = await buildDepositSession(bookingId);
  if ("error" in result) return { error: result.error };
  redirect(result.url);
}

// Côté TATOUEUR (bouton du dashboard) : génère le lien d'acompte, l'envoie au
// client par email et passe la demande en « acompte attendu ».
export async function requestDeposit(
  bookingId: string,
  _prevState: DepositRequestState,
  _formData: FormData,
): Promise<DepositRequestState> {
  // Paramètres imposés par la signature useActionState (non utilisés ici).
  void _prevState;
  void _formData;

  const result = await buildDepositSession(bookingId);
  if ("error" in result) return { error: result.error };

  const admin = createAdminClient();
  await admin
    .from("booking_requests")
    .update({ status: "acompte_attendu" })
    .eq("id", bookingId);

  if (result.clientEmail) {
    await sendDepositRequest({
      to: result.clientEmail,
      studioName: result.studioName,
      url: result.url,
      amountLabel: result.amountLabel,
    });
  }

  return {
    ok: true,
    message: `Lien d'acompte (${result.amountLabel}) envoyé au client.`,
  };
}
