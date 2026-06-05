import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/server";
import type { Artist } from "@/lib/types";

// Couche d'accès aux données (DAL). On centralise ici la vérification de session,
// mémoïsée le temps d'un rendu (React cache) pour éviter les appels en double.

// Utilisateur authentifié auprès de Supabase (ou null).
export const getUser = cache(async () => {
  // Supabase pas encore configuré : aucun utilisateur (les pages restent visibles).
  if (!isSupabaseConfigured()) return null;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

// Profil "tatoueur" (table artists) lié à l'utilisateur connecté (ou null).
export const getArtist = cache(async (): Promise<Artist | null> => {
  const user = await getUser();
  if (!user) return null;

  const supabase = await createClient();
  const { data } = await supabase
    .from("artists")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (data as Artist) ?? null;
});

// À appeler en tête des pages PROTÉGÉES : redirige vers /connexion si besoin.
export const requireArtist = cache(async (): Promise<Artist> => {
  const user = await getUser();
  if (!user) redirect("/connexion");

  const artist = await getArtist();
  // Cas limite : utilisateur sans profil (création échouée). On renvoie au login.
  if (!artist) redirect("/connexion");

  return artist;
});
