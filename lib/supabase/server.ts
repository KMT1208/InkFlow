import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

export { isSupabaseConfigured } from "@/lib/supabase/config";

// Client Supabase côté SERVEUR (Server Components, Server Actions, Route Handlers).
// Next.js 16 : cookies() est asynchrone, on l'attend avant de créer le client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(getSupabaseUrl(), getSupabasePublishableKey(), {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options),
          );
        } catch {
          // Appel depuis un Server Component : y écrire un cookie est interdit.
          // Sans gravité : la session est rafraîchie par proxy.ts à chaque requête.
        }
      },
    },
  });
}
