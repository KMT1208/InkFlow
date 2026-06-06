"use server";

import { isSupabaseConfigured } from "@/lib/supabase/server";
import { bookingRequestSchema } from "@/lib/validation";

export type BookingState =
  | {
      ok?: boolean;
      demo?: boolean;
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

// Dépôt d'une demande de réservation depuis la page publique.
// ⚠️ Joignable en POST direct → on valide TOUT avec zod.
// Mode démo (Supabase non configuré) : on simule l'envoi.
// Mode réel (Phase 3) : insertion via client service-role (RLS refuse l'anonyme)
// + création du PaymentIntent d'acompte Stripe avant confirmation.
export async function submitBookingRequest(
  _state: BookingState,
  formData: FormData,
): Promise<BookingState> {
  const parsed = bookingRequestSchema.safeParse({
    slug: formData.get("slug"),
    projectType: formData.get("projectType"),
    flashId: formData.get("flashId") || undefined,
    description: formData.get("description") || undefined,
    bodyZone: formData.get("bodyZone") || undefined,
    size: formData.get("size") || undefined,
    budget: formData.get("budget") || undefined,
    preferredDate: formData.get("preferredDate") || undefined,
    clientName: formData.get("clientName"),
    clientEmail: formData.get("clientEmail"),
    clientPhone: formData.get("clientPhone") || undefined,
    consent: formData.get("consent") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs signalés.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // TODO Phase 3 : rate-limit + upload références (bucket privé) + insert
  // service-role dans booking_requests + PaymentIntent acompte (Stripe Connect).
  if (!isSupabaseConfigured()) {
    return { ok: true, demo: true };
  }

  return { ok: true, demo: false };
}
