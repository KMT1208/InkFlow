"use server";

import { isSupabaseConfigured } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
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
// Mode réel : insertion via client service-role (RLS refuse l'anonyme) +
// upload des références dans le bucket privé.
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

  // Démo : on simule l'envoi (la page affiche l'écran de succès).
  if (!isSupabaseConfigured()) {
    return { ok: true, demo: true };
  }

  const data = parsed.data;
  const admin = createAdminClient();

  // Studio ciblé par le slug de la page publique.
  const { data: artist } = await admin
    .from("artists")
    .select("id")
    .eq("slug", data.slug)
    .maybeSingle();
  if (!artist) {
    return { error: "Studio introuvable." };
  }

  // Anti-spam : max 3 demandes / email / studio sur 10 minutes.
  const since = new Date(Date.now() - 10 * 60_000).toISOString();
  const { count } = await admin
    .from("booking_requests")
    .select("id", { count: "exact", head: true })
    .eq("artist_id", artist.id)
    .eq("client_email", data.clientEmail)
    .gte("created_at", since);
  if ((count ?? 0) >= 3) {
    return {
      error: "Trop de demandes envoyées récemment. Réessayez dans quelques minutes.",
    };
  }

  // Insertion de la demande.
  const { data: inserted, error: insertError } = await admin
    .from("booking_requests")
    .insert({
      artist_id: artist.id,
      flash_id: data.flashId || null,
      client_name: data.clientName,
      client_email: data.clientEmail,
      client_phone: data.clientPhone || null,
      project_type: data.projectType,
      description: data.description || null,
      body_zone: data.bodyZone || null,
      size: data.size || null,
      preferred_slots: {
        budget: data.budget ?? null,
        preferredDate: data.preferredDate ?? null,
      },
      status: "nouvelle",
    })
    .select("id")
    .single();
  if (insertError || !inserted) {
    return { error: "Échec de l'enregistrement de la demande. Réessayez." };
  }

  // Upload des images de référence dans le bucket privé (best-effort, max 6).
  const files = formData
    .getAll("references")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, 6);
  if (files.length > 0) {
    const paths: string[] = [];
    for (const file of files) {
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${artist.id}/${inserted.id}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await admin.storage
        .from("references")
        .upload(path, file, {
          contentType: file.type || "application/octet-stream",
          upsert: false,
        });
      if (!uploadError) paths.push(path);
    }
    if (paths.length > 0) {
      await admin
        .from("booking_requests")
        .update({ reference_paths: paths })
        .eq("id", inserted.id);
    }
  }

  // TODO : notifier le tatoueur par email (sa première vraie demande !).
  return { ok: true, demo: false };
}
