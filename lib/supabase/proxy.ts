import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
  isSupabaseConfigured,
} from "@/lib/supabase/config";

// Rafraîchit la session Supabase à chaque requête et propage les cookies à jour.
// Appelé depuis proxy.ts (le « middleware » de Next 16).
export async function updateSession(request: NextRequest) {
  // Supabase non configuré : on laisse passer (site consultable, auth inactive).
  if (!isSupabaseConfigured()) {
    return NextResponse.next({ request });
  }

  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    getSupabaseUrl(),
    getSupabasePublishableKey(),
    {
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
    },
  );

  // getUser() valide le jeton auprès de Supabase. On protège l'appel : un souci
  // réseau Supabase ne doit jamais faire tomber tout le site (le proxy tourne
  // sur chaque requête).
  try {
    await supabase.auth.getUser();
  } catch {
    // Supabase momentanément injoignable : on ne bloque pas la navigation.
  }

  return response;
}
