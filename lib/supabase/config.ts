// Valeurs publiques Supabase (URL + clé « publishable »), avec repli.
//
// Objectif : qu'une variable d'environnement mal renseignée chez l'hébergeur
// (ex. URL et clé inversées dans le dashboard) ne bloque pas la production.
// L'URL et la clé publishable sont PUBLIQUES (jamais secrètes — la sécurité
// repose sur la RLS). La clé « secret » reste, elle, exclusivement en variable
// d'env (jamais committée).
//
// Précédence : on prend la variable d'env si elle est valide, sinon le repli.

const FALLBACK_URL = "https://huzhhmullkdiunejvbu.supabase.co";
const FALLBACK_PUBLISHABLE = "sb_publishable_Gixro7iP1UHs13bwH5j5Pw_Lc-u7DTf";

function isHttpsUrl(value: string | undefined): boolean {
  if (!value) return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function getSupabaseUrl(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return isHttpsUrl(env) ? (env as string) : FALLBACK_URL;
}

export function getSupabasePublishableKey(): string {
  const env = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return env && env.startsWith("sb_publishable_") ? env : FALLBACK_PUBLISHABLE;
}

// Considéré « configuré » dès qu'une variable Supabase publique est présente
// dans l'environnement (le cas en production). En local sans `.env.local`,
// rien n'est défini → mode démonstration.
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
      process.env.NEXT_PUBLIC_SUPABASE_URL,
  );
}
