import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { ArtistPublic } from "@/lib/types";
import { DEMO_ARTIST, DEMO_FLASH, type PublicFlash } from "@/lib/demo";

export type PublicArtistData = {
  artist: ArtistPublic;
  flash: PublicFlash[];
  demo: boolean;
};

// Données publiques d'un tatoueur (mini-site). Lit la vue `artist_public` et les
// flash disponibles. Tant que Supabase n'est pas configuré, renvoie une démo
// pour n'importe quel slug afin de visualiser le rendu.
export async function getPublicArtist(slug: string): Promise<PublicArtistData | null> {
  if (!isSupabaseConfigured()) {
    return { artist: { ...DEMO_ARTIST, slug }, flash: DEMO_FLASH, demo: true };
  }

  const supabase = await createClient();
  const { data: artist } = await supabase
    .from("artist_public")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (!artist) return null;

  const { data: flash } = await supabase
    .from("flash")
    .select("id, title, description, size, placements, price")
    .eq("artist_id", artist.id)
    .eq("is_available", true)
    .order("position", { ascending: true });

  return {
    artist: artist as ArtistPublic,
    flash: (flash ?? []) as PublicFlash[],
    demo: false,
  };
}
