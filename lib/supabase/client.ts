import { createBrowserClient } from "@supabase/ssr";
import {
  getSupabasePublishableKey,
  getSupabaseUrl,
} from "@/lib/supabase/config";

// Client Supabase pour le NAVIGATEUR (à utiliser dans les composants client).
// Les clés publiques (URL + publishable) sont volontairement exposées au
// navigateur : la sécurité repose sur les règles RLS définies dans la base.
export function createClient() {
  return createBrowserClient(getSupabaseUrl(), getSupabasePublishableKey());
}
