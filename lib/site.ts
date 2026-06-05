// URL publique de l'application, utilisée pour construire les liens des emails
// (confirmation, réinitialisation) et l'URL publique d'un tatoueur.
// Définie via NEXT_PUBLIC_SITE_URL ; en local, vaut http://localhost:3000.
export function getSiteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000"
  );
}
