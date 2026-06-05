import { createBrowserClient } from "@supabase/ssr";

// Client Supabase pour le NAVIGATEUR (à utiliser dans les composants client).
// Les clés publiques (URL + anon) sont volontairement exposées au navigateur :
// la sécurité repose sur les règles RLS définies dans la base (voir migration).
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
