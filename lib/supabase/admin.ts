import "server-only";
import { createClient } from "@supabase/supabase-js";
import { getSupabaseUrl } from "@/lib/supabase/config";

// Client Supabase SERVICE-ROLE (clé secrète « sb_secret_… »).
// ⚠️ Ce client BYPASSE la RLS : à n'utiliser QUE côté serveur, dans des chemins
// strictement contrôlés et déjà validés — webhooks Stripe/Twilio, soumission
// publique d'intake (après zod + rate limit), tâches planifiées (rappels).
// Ne JAMAIS l'importer depuis un composant client : « server-only » fait échouer
// le build si une frontière client tente de le charger.
export function createAdminClient() {
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!secretKey) {
    throw new Error(
      "Client service-role indisponible : SUPABASE_SECRET_KEY manquant.",
    );
  }

  return createClient(getSupabaseUrl(), secretKey, {
    // Pas de session côté serveur : on agit avec la clé secrète, sans utilisateur.
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
