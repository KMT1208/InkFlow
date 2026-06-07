"use server";

import { revalidatePath } from "next/cache";
import { requireArtist } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { artistProfileSchema, isReservedSlug } from "@/lib/validation";

export type ProfileState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

// Sauvegarde du profil du tatoueur. L'artiste met à jour SA propre ligne
// (autorisé par la RLS owner). Valide tout avec zod.
export async function updateArtistProfile(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const artist = await requireArtist();

  const parsed = artistProfileSchema.safeParse({
    displayName: formData.get("displayName"),
    slug: formData.get("slug"),
    bio: formData.get("bio") || undefined,
    city: formData.get("city") || undefined,
    instagram: formData.get("instagram") || undefined,
    website: formData.get("website") || undefined,
    theme: formData.get("theme"),
    depositType: formData.get("depositType"),
    depositValue: formData.get("depositValue"),
    depositRefundable: formData.get("depositRefundable") === "on",
  });

  if (!parsed.success) {
    return {
      error: "Vérifie les champs signalés.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }
  const d = parsed.data;

  if (isReservedSlug(d.slug)) {
    return { error: "Ce lien est réservé.", fieldErrors: { slug: ["Lien réservé."] } };
  }

  const supabase = await createClient();

  // Unicité du slug (hors soi-même).
  const { data: clash } = await supabase
    .from("artists")
    .select("id")
    .eq("slug", d.slug)
    .neq("id", artist.id)
    .maybeSingle();
  if (clash) {
    return { error: "Ce lien est déjà pris.", fieldErrors: { slug: ["Déjà pris."] } };
  }

  // deposit_value : centimes si "fixed" (euros saisis), pourcentage si "percent".
  const depositValue =
    d.depositType === "fixed"
      ? Math.round(d.depositValue * 100)
      : Math.min(100, Math.round(d.depositValue));

  const { error } = await supabase
    .from("artists")
    .update({
      display_name: d.displayName,
      slug: d.slug,
      bio: d.bio ?? null,
      city: d.city ?? null,
      instagram: d.instagram ?? null,
      website: d.website ?? null,
      theme: d.theme,
      deposit_type: d.depositType,
      deposit_value: depositValue,
      deposit_refundable: d.depositRefundable,
      onboarding_completed: true,
    })
    .eq("id", artist.id);

  if (error) {
    return { error: "Échec de l'enregistrement. Réessayez." };
  }

  revalidatePath("/dashboard/reglages");
  revalidatePath(`/${d.slug}`);
  return { ok: true };
}
