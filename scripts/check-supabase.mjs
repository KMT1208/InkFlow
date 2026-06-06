// Vérifie la connexion Supabase (clés valides ?) et si la migration est appliquée.
// N'affiche jamais les secrets. Usage : node scripts/check-supabase.mjs
import { config } from "dotenv";
config({ path: ".env.local" });
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const secret = process.env.SUPABASE_SECRET_KEY;

if (!url || !secret) {
  console.log("KO — URL ou SECRET manquant dans .env.local");
  process.exit(1);
}

const admin = createClient(url, secret, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin.auth.admin.listUsers();
if (error) {
  console.log("KO — clés invalides ou projet injoignable :", error.message);
  process.exit(1);
}
console.log(`OK — connexion valide. Utilisateurs existants : ${data.users.length}`);

const { error: tableErr } = await admin.from("artists").select("id").limit(1);
if (tableErr) {
  console.log(`MIGRATION — table 'artists' absente → migration pas encore appliquée (${tableErr.code ?? tableErr.message})`);
} else {
  console.log("MIGRATION — table 'artists' présente → migration déjà appliquée");
}
