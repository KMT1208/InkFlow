import { NextResponse, type NextRequest } from "next/server";
import type Stripe from "stripe";
import { getStripe, isStripeConfigured } from "@/lib/stripe";
import { createAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { sendBookingConfirmation } from "@/lib/email";
import { formatEur } from "@/lib/money";

// Webhook Stripe. Route Handler (le seul usage autorisé des route handlers ici).
// 1) Vérifie la SIGNATURE (constructEvent) — sinon 400.
// 2) Idempotence : on enregistre event.id dans `stripe_events` ; si déjà vu, on
//    acquitte sans retraiter.
// 3) Sur paiement d'acompte réussi : demande -> "acompte_paye" + ligne payments.
export async function POST(request: NextRequest) {
  if (!isStripeConfigured() || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "non configuré" }, { status: 503 });
  }

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    return NextResponse.json({ error: "STRIPE_WEBHOOK_SECRET manquant" }, { status: 500 });
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "signature manquante" }, { status: 400 });
  }

  // Corps BRUT requis pour la vérification de signature.
  const payload = await request.text();
  const stripe = getStripe();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (err) {
    const message = err instanceof Error ? err.message : "erreur";
    return NextResponse.json({ error: `Signature invalide : ${message}` }, { status: 400 });
  }

  const admin = createAdminClient();

  // Idempotence : insertion de l'évènement. Conflit de clé = déjà traité.
  const { error: dedupeError } = await admin
    .from("stripe_events")
    .insert({ id: event.id, type: event.type });
  if (dedupeError) {
    return NextResponse.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;
      const bookingId = session.metadata?.booking_id;
      const artistId = session.metadata?.artist_id;

      if (bookingId && session.payment_status === "paid") {
        await admin
          .from("booking_requests")
          .update({ status: "acompte_paye" })
          .eq("id", bookingId);

        await admin.from("payments").insert({
          artist_id: artistId,
          booking_id: bookingId,
          stripe_payment_intent_id:
            typeof session.payment_intent === "string" ? session.payment_intent : null,
          amount: session.amount_total ?? 0,
          currency: session.currency ?? "eur",
          status: "succeeded",
        });

        // Email de confirmation au client (best-effort, ne bloque pas le webhook).
        const { data: bk } = await admin
          .from("booking_requests")
          .select("client_email, client_name")
          .eq("id", bookingId)
          .single();
        let studioName = "votre studio";
        if (artistId) {
          const { data: art } = await admin
            .from("artists")
            .select("display_name")
            .eq("id", artistId)
            .single();
          if (art?.display_name) studioName = art.display_name as string;
        }
        if (bk?.client_email) {
          await sendBookingConfirmation({
            to: bk.client_email as string,
            studioName,
            clientName: (bk.client_name as string | null) ?? null,
            depositLabel: formatEur(session.amount_total ?? 0),
          });
        }
        // TODO Phase 4 : SMS de confirmation (Twilio).
      }
    }
  } catch (err) {
    // On loggue et on renvoie 500 pour que Stripe réessaie (l'évènement reste
    // marqué traité ; un retraitement plus robuste passera par une transaction).
    console.error("Erreur traitement webhook Stripe:", err);
    return NextResponse.json({ error: "traitement échoué" }, { status: 500 });
  }

  return NextResponse.json({ received: true });
}
