import { OAuthButtons } from "@/components/auth/oauth-buttons";
import { MagicLinkForm } from "@/components/auth/magic-link-form";

// Méthodes d'authentification alternatives (Google + lien magique), partagées
// par les pages connexion et inscription. Le mot de passe reste au-dessus.
export function AltAuth() {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-3 text-xs uppercase tracking-wider text-bone-dim">
        <span className="h-px flex-1 bg-line" />
        ou
        <span className="h-px flex-1 bg-line" />
      </div>
      <OAuthButtons />
      <MagicLinkForm />
    </div>
  );
}
