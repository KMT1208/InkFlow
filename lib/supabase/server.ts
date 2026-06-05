import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Vrai uniquement si les clés Supabase sont présentes dans l'environnement.
// Permet à l'app de rester consultable avant que le fondateur ne configure ses clés.
export function isSupabaseConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  );
}

// Client Supabase côté SERVEUR (Server Components, Server Actions, Route Handlers).
// Next.js 16 : cookies() est asynchrone, on l'attend avant de créer le client.
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
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
    },
  );
}
