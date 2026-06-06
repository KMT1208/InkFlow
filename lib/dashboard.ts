import { redirect } from "next/navigation";
import { isSupabaseConfigured } from "@/lib/supabase/server";
import { getArtist } from "@/lib/auth";
import { DEMO_DASHBOARD_ARTIST } from "@/lib/demo";
import type { Artist } from "@/lib/types";

// Artiste du tableau de bord. Tant que Supabase n'est pas configuré, on renvoie
// un artiste de démonstration (mode démo) pour visualiser le dashboard sans
// backend. Une fois configuré, l'accès exige une vraie session (sinon /connexion).
export async function getDashboardArtist(): Promise<{ artist: Artist; demo: boolean }> {
  if (!isSupabaseConfigured()) {
    return { artist: DEMO_DASHBOARD_ARTIST, demo: true };
  }
  const artist = await getArtist();
  if (!artist) redirect("/connexion");
  return { artist, demo: false };
}
