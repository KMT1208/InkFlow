"use server";

import * as z from "zod";
import { revalidatePath } from "next/cache";
import { requireArtist } from "@/lib/auth";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";

// Validation d'un flash. La photo est OPTIONNELLE (gérée à part, hors zod).
const flashSchema = z.object({
  title: z.string().trim().min(1, { error: "Donnez un titre au flash." }).max(120),
  price: z.string().trim().optional(),
  size: z.string().trim().max(60).optional(),
  placements: z.string().trim().max(200).optional(),
  isAvailable: z.boolean(),
});

export type FlashState =
  | {
      ok?: boolean;
      error?: string;
      fieldErrors?: Record<string, string[] | undefined>;
    }
  | undefined;

// Création d'un flash par le tatoueur connecté. La photo est facultative :
// on n'upload (bucket public `flash`) que si un fichier non vide est fourni.
export async function createFlash(
  _state: FlashState,
  formData: FormData,
): Promise<FlashState> {
  const parsed = flashSchema.safeParse({
    title: formData.get("title"),
    price: formData.get("price") || undefined,
    size: formData.get("size") || undefined,
    placements: formData.get("placements") || undefined,
    isAvailable: formData.get("isAvailable") === "on",
  });
  if (!parsed.success) {
    return {
      error: "Vérifiez les champs.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  // Mode démo (Supabase non configuré) : on valide mais sans écrire en base.
  if (!isSupabaseConfigured()) return { ok: true };

  const data = parsed.data;
  const artist = await requireArtist();
  const supabase = await createClient();

  const priceCents = data.price
    ? Math.round(Number(data.price.replace(",", ".")) * 100)
    : null;
  const placements = data.placements
    ? data.placements.split(",").map((s) => s.trim()).filter(Boolean)
    : [];

  // Photo OPTIONNELLE : upload uniquement si un fichier est réellement fourni.
  let imageUrl: string | null = null;
  const file = formData.get("image");
  if (file instanceof File && file.size > 0) {
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const path = `${artist.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage
      .from("flash")
      .upload(path, file, {
        contentType: file.type || "image/jpeg",
        upsert: false,
      });
    if (!uploadError) {
      imageUrl = supabase.storage.from("flash").getPublicUrl(path).data
        .publicUrl;
    }
  }

  const { error } = await supabase.from("flash").insert({
    artist_id: artist.id,
    title: data.title,
    price: priceCents != null && Number.isFinite(priceCents) ? priceCents : null,
    size: data.size ?? null,
    placements,
    image_url: imageUrl,
    is_available: data.isAvailable,
  });
  if (error) {
    return { error: "Échec de l'enregistrement du flash. Réessayez." };
  }

  revalidatePath("/dashboard/flash");
  return { ok: true };
}

// Active / désactive la réservation d'un flash (toggle « réservable »).
export async function toggleFlashAvailability(
  flashId: string,
  available: boolean,
): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await requireArtist();
  const supabase = await createClient();
  await supabase
    .from("flash")
    .update({ is_available: available })
    .eq("id", flashId);
  revalidatePath("/dashboard/flash");
}

// Suppression d'un flash.
export async function deleteFlash(flashId: string): Promise<void> {
  if (!isSupabaseConfigured()) return;
  await requireArtist();
  const supabase = await createClient();
  await supabase.from("flash").delete().eq("id", flashId);
  revalidatePath("/dashboard/flash");
}
