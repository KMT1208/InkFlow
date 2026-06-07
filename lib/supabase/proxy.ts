import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

// Rafraîchit la session Supabase à chaque requête et propage les cookies à jour.
// Appelé depuis proxy.ts (le « middleware » de Next 16).
export async function updateSession(request: NextRequest) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  // Supabase non configuré OU URL invalide (ex. clé collée par erreur) : on
  // laisse simplement passer la requête au lieu de planter — le site reste
  // consultable, seule l'authentification est inactive.
  let validUrl = false;
  try {
    validUrl = Boolean(url) && new URL(url as string).protocol === "https:";
  } catch {
    validUrl = false;
  }
  if (!validUrl || !url || !key) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value),
        );
        response = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          response.cookies.set(name, value, options),
        );
      },
    },
  });

  // IMPORTANT : ne rien exécuter entre createServerClient et getUser().
  // getUser() valide le jeton auprès de Supabase et le rafraîchit si besoin.
  // On protège l'appel : un souci réseau Supabase ne doit jamais faire tomber
  // tout le site (le proxy s'exécute sur chaque requête).
  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase momentanément injoignable : on ne bloque pas la navigation.
  }

  return response;
}
