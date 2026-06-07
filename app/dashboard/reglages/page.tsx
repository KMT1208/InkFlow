import { isSupabaseConfigured } from "@/lib/supabase/server";
import { isStripeConfigured } from "@/lib/stripe";
import { SettingsForm } from "@/components/dashboard/settings-form";
import { StripeConnectButton } from "@/components/dashboard/stripe-connect-button";
import { SubscribePanel } from "@/components/dashboard/subscribe-panel";
import { getDashboardArtist } from "@/lib/dashboard";

export default async function ReglagesPage({
  searchParams,
}: {
  searchParams: Promise<{ stripe?: string; abo?: string }>;
}) {
  const { stripe, abo } = await searchParams;
  const liveStripe = isSupabaseConfigured() && isStripeConfigured();
  const { artist, demo } = await getDashboardArtist();

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
      {abo === "ok" && (
        <p className="rounded-lg border border-emerald-500/30 bg-emerald-500/5 p-3 text-sm text-emerald-400">
          Abonnement actif — bienvenue ! Votre essai vient de démarrer.
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

      {liveStripe && (
        <section className="rounded-2xl border border-line bg-surface/40 p-6">
          <h2 className="font-serif text-lg text-bone">Abonnement InkFlow</h2>
          <p className="mb-4 mt-1 text-sm text-bone-dim">
            Choisissez votre formule. 14 jours d&apos;essai, sans engagement.
          </p>
          <SubscribePanel />
        </section>
      )}

      <SettingsForm artist={artist} demo={demo} />
    </div>
  );
}
