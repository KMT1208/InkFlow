import Link from "next/link";
import { redirect } from "next/navigation";
import { getArtist } from "@/lib/auth";
import { SignUpForm } from "@/components/auth/sign-up-form";
import { AltAuth } from "@/components/auth/alt-auth";

export default async function InscriptionPage() {
  if (await getArtist()) redirect("/dashboard");

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Créer mon studio</h1>
      <p className="mb-6 text-sm text-bone-dim">
        Votre page de réservation en quelques secondes.
      </p>

      <SignUpForm />

      <AltAuth />

      <p className="mt-6 text-center text-sm text-bone-dim">
        Déjà inscrit ?{" "}
        <Link href="/connexion" className="text-ink hover:underline">
          Se connecter
        </Link>
      </p>
    </div>
  );
}
