import Link from "next/link";
import { redirect } from "next/navigation";
import { getArtist } from "@/lib/auth";
import { SignInForm } from "@/components/auth/sign-in-form";

// Next 16 : searchParams est asynchrone.
export default async function ConnexionPage({
  searchParams,
}: {
  searchParams: Promise<{ erreur?: string }>;
}) {
  // Déjà connecté → direction le tableau de bord.
  if (await getArtist()) redirect("/dashboard");

  const { erreur } = await searchParams;

  return (
    <div>
      <h1 className="mb-1 text-2xl font-semibold">Connexion</h1>
      <p className="mb-6 text-sm text-bone-dim">Accédez à votre tableau de bord.</p>

      {erreur === "lien-invalide" && (
        <p className="mb-4 rounded-lg border border-ink/40 bg-ink/10 p-3 text-sm text-bone">
          Ce lien est invalide ou a expiré. Reconnectez-vous ou redemandez un lien.
        </p>
      )}

      <SignInForm />

      <p className="mt-6 text-center text-sm text-bone-dim">
        Pas encore de studio ?{" "}
        <Link href="/inscription" className="text-ink hover:underline">
          Créer un compte
        </Link>
      </p>
    </div>
  );
}
