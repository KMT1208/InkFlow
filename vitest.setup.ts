import { config } from "dotenv";

// Charge .env.local pour les tests d'intégration (RLS) qui parlent à un vrai
// projet Supabase. Sans effet sur les tests unitaires. En l'absence du fichier,
// les variables restent indéfinies et les suites d'intégration se mettent en veille.
config({ path: ".env.local" });
