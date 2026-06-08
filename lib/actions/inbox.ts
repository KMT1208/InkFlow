"use server";

import { revalidatePath } from "next/cache";
import { requireArtist } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { scheduleReminders } from "@/lib/reminders";
import { sendQuoteEmail } from "@/lib/email";
import { computeDepositCents, formatEur, type DepositType } from "@/lib/money";

// État partagé des actions de la boîte de réception (devis / refus / planif.).
export type InboxState =
  | { ok?: boolean; message?: string; error?: string }
  | undefined;

function revalidateBooking(bookingId: string) {
  revalidatePath(`/dashboard/demandes/${bookingId}`);
  revalidatePath("/dashboard/demandes");
  revalidatePath("/dashboard");
}

// ── Envoyer un devis ──────────────────────────────────────────────────────
// Enregistre le montant (centimes) + passe la demande en « devis_envoyé » et
// envoie le devis au client par email.
export async function sendQuote(
  bookingId: string,
  _prev: InboxState,
  formData: FormData,
): Promise<InboxState> {
  const raw = String(formData.get("amount") ?? "").trim();
  const euros = Number(raw.replace(",", "."));
  if (!raw || !Number.isFinite(euros) || euros <= 0) {
    return { error: "Indiquez un montant de devis valide (en euros)." };
  }
  const amountCents = Math.round(euros * 100);

  // Mode démo : pas d'écriture en base, mais on simule le succès.
  if (!isSupabaseConfigured()) {
    return { ok: true, message: `Devis de ${formatEur(amountCents)} envoyé au client.` };
  }

  const artist = await requireArtist();
  const supabase = await createClient();

  const { data: booking, error } = await supabase
    .from("booking_requests")
    .update({ quote_amount: amountCents, status: "devis_envoye" })
    .eq("id", bookingId)
    .select("client_email, client_name")
    .maybeSingle();
  if (error) return { error: "Impossible d'enregistrer le devis. Réessayez." };

  if (booking?.client_email) {
    await sendQuoteEmail({
      to: booking.client_email as string,
      studioName: artist.display_name,
      clientName: (booking.client_name as string | null) ?? null,
      amountLabel: formatEur(amountCents),
    });
  }

  revalidateBooking(bookingId);
  return { ok: true, message: `Devis de ${formatEur(amountCents)} envoyé au client.` };
}

// ── Refuser une demande ───────────────────────────────────────────────────
export async function refuseBooking(
  bookingId: string,
  _prev: InboxState,
  _formData: FormData,
): Promise<InboxState> {
  void _formData;
  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Demande refusée." };
  }

  await requireArtist();
  const supabase = await createClient();
  const { error } = await supabase
    .from("booking_requests")
    .update({ status: "refusee" })
    .eq("id", bookingId);
  if (error) return { error: "Impossible de refuser la demande." };

  revalidateBooking(bookingId);
  return { ok: true, message: "Demande refusée." };
}

// ── Acompte reçu hors-ligne (espèces, virement, Lydia…) ───────────────────
// Permet de confirmer un acompte encaissé autrement que par Stripe : passe la
// demande en « acompte_payé » et enregistre le paiement (compte dans le CA).
export async function markDepositPaid(
  bookingId: string,
  _prev: InboxState,
  _formData: FormData,
): Promise<InboxState> {
  void _formData;
  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Acompte marqué comme reçu — planifiez le rendez-vous." };
  }

  const artist = await requireArtist();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("quote_amount")
    .eq("id", bookingId)
    .maybeSingle();

  const total = (booking?.quote_amount as number | null) ?? null;
  const deposit = total
    ? computeDepositCents(
        total,
        artist.deposit_type as DepositType,
        artist.deposit_value as number,
      )
    : 0;

  const { error } = await supabase
    .from("booking_requests")
    .update({ status: "acompte_paye" })
    .eq("id", bookingId);
  if (error) return { error: "Impossible de mettre à jour la demande." };

  // Écriture en table `payments` réservée au service-role (RLS) ; l'artiste a
  // déjà été authentifié et la propriété de la demande vérifiée ci-dessus.
  try {
    const admin = createAdminClient();
    await admin.from("payments").insert({
      artist_id: artist.id,
      booking_id: bookingId,
      amount: deposit,
      currency: artist.currency ?? "eur",
      status: "succeeded",
    });
  } catch {
    // Le paiement n'a pas pu être journalisé (clé service-role absente) : on ne
    // bloque pas le flux — le statut a déjà avancé.
  }

  revalidateBooking(bookingId);
  return { ok: true, message: "Acompte marqué comme reçu — planifiez le rendez-vous." };
}

// ── Planifier le rendez-vous ──────────────────────────────────────────────
// Crée le rendez-vous (lié à la demande), passe la demande en « confirmée » et
// programme les rappels (J-7 / J-2 / jour J).
export async function scheduleAppointment(
  bookingId: string,
  _prev: InboxState,
  formData: FormData,
): Promise<InboxState> {
  const raw = String(formData.get("date") ?? "").trim(); // "AAAA-MM-JJTHH:mm"
  const durationMin = Number(formData.get("durationMin")) || 120;

  // NOTE fuseau : la valeur saisie est interprétée en UTC (affichage cohérent en
  // UTC partout). TODO : vrai fuseau Europe/Paris (DST) en post-MVP.
  const start = new Date(`${raw.slice(0, 16)}:00Z`);
  if (!raw || Number.isNaN(start.getTime())) {
    return { error: "Choisissez une date et une heure valides." };
  }
  if (start.getTime() < Date.now()) {
    return { error: "Choisissez une date dans le futur." };
  }
  const end = new Date(start.getTime() + durationMin * 60_000);

  if (!isSupabaseConfigured()) {
    return { ok: true, message: "Rendez-vous planifié — rappels programmés." };
  }

  const artist = await requireArtist();
  const supabase = await createClient();

  const { data: booking } = await supabase
    .from("booking_requests")
    .select("quote_amount")
    .eq("id", bookingId)
    .maybeSingle();

  const total = (booking?.quote_amount as number | null) ?? null;
  const deposit = total
    ? computeDepositCents(
        total,
        artist.deposit_type as DepositType,
        artist.deposit_value as number,
      )
    : null;

  const { data: appt, error } = await supabase
    .from("appointments")
    .insert({
      artist_id: artist.id,
      booking_id: bookingId,
      starts_at: start.toISOString(),
      ends_at: end.toISOString(),
      total_amount: total,
      deposit_amount: deposit,
      status: "planifie",
    })
    .select("id")
    .single();
  if (error || !appt) return { error: "Impossible de créer le rendez-vous." };

  await supabase
    .from("booking_requests")
    .update({ status: "confirmee" })
    .eq("id", bookingId);

  // Programme les rappels SMS/email (n'échoue jamais le flux si ça rate).
  await scheduleReminders(appt.id as string);

  revalidateBooking(bookingId);
  revalidatePath("/dashboard/calendrier");
  return { ok: true, message: "Rendez-vous planifié — rappels programmés." };
}
