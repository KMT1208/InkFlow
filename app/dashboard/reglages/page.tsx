import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/stripe";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { StripeConnectButton } from "@/components/dashboard/stripe-connect-button";

export default async function ReglagesPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string }>;
}) {
  const { stripe } = await searchParams;
  const liveStripe = isSupabaseConfigured() && isStripeConfigured();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-semibold">Réglages</h1>
        <p className="mt-1 text-sm text-bone-dim">
          Votre profil, votre mini-site, vos acomptes et vos disponibilités.
        </p>
      </div>

      {stripe === "ok" && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          Compte Stripe connecté — vous pouvez désormais encaisser les acomptes.
        </p>
      )}
      {stripe === "refresh" && (
        <p className="rounded-lg border border-ink/40 bg-ink/10 p-3 text-sm text-bone">
          Onboarding Stripe interrompu — relancez la connexion pour le finaliser.
        </p>
      )}

      {liveStripe && (
        <section className="rounded-2xl border border-line bg-surface/40 p-6">
          <h2 className="font-serif text-lg text-bone">Paiements (Stripe Connect)</h2>
          <p className="mb-4 mt-1 text-sm text-bone-dim">
            Connectez votre compte pour recevoir les acomptes (onboarding Stripe Express).
          </p>
          <StripeConnectButton />
        </section>
      )}

      <SettingsForm />
    </div>
  );
}
