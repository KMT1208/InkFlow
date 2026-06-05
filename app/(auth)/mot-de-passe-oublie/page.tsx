import Link from "next/link";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function MotDePasseOubliePage() {
  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Mot de passe oublié</h1>
      <p className="mb-6 text-sm text-bone-dim">
        Entrez votre email, on vous envoie un lien pour le réinitialiser.
      </p>

      <ForgotPasswordForm />

      <p className="mt-6 text-center text-sm text-bone-dim">
        <Link href="/connexion" className="text-ink hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </div>
  );
}
