import { redirect } from "next/navigation";
import { getUser } from "@/lib/auth";
import { NewPasswordForm } from "@/components/auth/new-password-form";

// Accessible après avoir cliqué sur le lien de réinitialisation (session ouverte).
export default async function NouveauMotDePassePage() {
  if (!(await getUser())) redirect("/connexion");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Nouveau mot de passe</h1>
      <p className="mb-6 text-sm text-bone-dim">
        Choisissez un nouveau mot de passe pour votre compte.
      </p>

      <NewPasswordForm />
    </div>
  );
}
